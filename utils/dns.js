const fs = require("fs");
const https = require("https");
const exec = require("child_process").exec;
const { getDocs, updateDoc } = require("../crud");

function createServer(domain, panelId, res) {
  fs.readFile("/etc/bind/named.conf.local", "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading named.conf.local: ${err.message}`);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const updatedContent = `${data}
zone "${domain}" {
  type master;
  file "/var/lib/bind/${domain}.hosts";
};
    `;

    if (domain.includes(".validpanel.com")) {
      createARecord(domain, "5.196.190.226");
      createVirtualHost(domain);
      createSSL();
      res.json({ message: "Created successfully" });
    } else {
      fs.writeFile("/etc/bind/named.conf.local", updatedContent, (err) => {
        if (err) {
          console.error(`Error writing named.conf.local: ${err.message}`);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        exec("systemctl reload bind9", (error, stdout, stderr) => {
          if (error) {
            console.error(`Error reloading BIND: ${error.message}`);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          if (stderr) {
            console.error(`Error reloading BIND: ${stderr}`);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          createARecord(domain, "5.196.190.226");
          createVirtualHost(domain);
          res.json({
            panelId: panelId,
            message: "Server created successfully",
          });
        });
      });
    }
  });
}

function createARecord(domain, ipAddress) {
  const zoneFileContent = `$TTL 3600
@ IN SOA ${domain} admin.${domain} (
  2024042800
  3600
  600
  1209600
  3600 )

@ IN A ${ipAddress}
www IN A ${ipAddress}
${domain}. IN NS ns1.validpanel.com.
${domain}. IN NS ns2.validpanel.com.

`;

  if (domain.includes(".validpanel.com")) {
    fs.readFile("/var/lib/bind/validpanel.com.hosts", "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading validpanel.com.hosts: ${err.message}`);
        return;
      }
      const updatedContent =
        data +
        `
${domain}. IN A ${ipAddress}
www.${domain}. IN A ${ipAddress}`;
      fs.writeFile(
        "/var/lib/bind/validpanel.com.hosts",
        updatedContent,
        (err) => {
          if (err) {
            console.error(`Error writing zone file: ${err.message}`);
            return;
          }
          exec("systemctl reload bind9", (error, stdout, stderr) => {
            if (error) {
              console.error(`Error reloading BIND: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Stderr: ${stderr}`);
              return;
            }
          });
        }
      );
    });
  } else {
    fs.writeFile(`/var/lib/bind/${domain}.hosts`, zoneFileContent, (err) => {
      if (err) {
        console.error(`Error writing zone file: ${err.message}`);
        return;
      }
      exec("systemctl reload bind9", (error, stdout, stderr) => {
        if (error) {
          console.error(`Error reloading BIND: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return;
        }
      });
    });
  }
}

function createVirtualHost(domain) {
  const fileContent = `<VirtualHost *:80>
  DocumentRoot /var/www/panels
  ServerName ${domain}
  ServerAlias www.${domain}
  <Directory /var/www/panels>
      Options Indexes FollowSymLinks
      AllowOverride All
      Require all granted
  </Directory>
  RewriteEngine on
  RewriteCond %{SERVER_NAME} =www.${domain} [OR]
  RewriteCond %{SERVER_NAME} =${domain}
  RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
`;

  fs.writeFile(
    `/etc/apache2/sites-available/${domain}.conf`,
    fileContent,
    (err) => {
      if (err) {
        console.error(`Error writing zone file: ${err.message}`);
        return;
      }
      exec(`a2ensite ${domain}.conf`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error enabling site: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Error enabling site: ${stderr}`);
          return;
        }
        exec("systemctl restart apache2", (error, stdout, stderr) => {
          if (error) {
            console.error(`Error restarting Apache: ${error.message}`);
            return;
          }
          if (stderr) {
            console.error(`Error restarting Apache: ${stderr}`);
            return;
          }
        });
      });
    }
  );
}

async function checkSSL(url) {
  return new Promise((resolve) => {
    const req = https.request(
      `https://${url}`,
      {
        rejectUnauthorized: true, // Enforce certificate validation
      },
      (res) => {
        resolve(res.statusCode === 200); // Site is using a valid SSL
      }
    );

    req.on("error", (e) => {
      if (
        e.code === "ECONNREFUSED" ||
        e.code === "ENOTFOUND" ||
        e.code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
        e.code === "CERT_HAS_EXPIRED" ||
        e.code === "CERT_COMMON_NAME_INVALID"
      ) {
        resolve(false); // SSL certificate issues or site not found
      } else {
        resolve(false); // Treat all other errors as non-SSL for simplicity
      }
    });

    req.end();
  });
}

async function createSSL() {
  const registeredPanels = getDocs("registeredPanels");
  const panelsWithoutSSL = registeredPanels.filter((panel) => !panel.ssl);

  for (const panel of panelsWithoutSSL) {
    const isSecured = await checkSSL(panel.uid);
    if (isSecured) {
      updateDoc("registeredPanels", panel.uid, { ssl: true });
      addProxies(panel.uid);
    } else {
      exec(
        `certbot --apache --redirect -d ${panel.uid}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error creating SSL: ${error.message}`);
            return;
          }
        }
      );
    }
  }
}

function addProxies(domain) {
  fs.readFile(
    `/etc/apache2/sites-enabled/${domain}-le-ssl.conf`,
    "utf8",
    (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }

      // Split file content by lines
      const lines = data.split("\n");
      const newLines = [
        "ProxyPreserveHost On",
        `ProxyPass /api/v2 http://${domain}:3001/api/v2`,
        `ProxyPassReverse /api/v2 http://${domain}:3001/api/v2`,
        `ProxyPass /sys/api http://${domain}:3001`,
        `ProxyPassReverse /sys/api http://${domain}:3001`,
      ];

      // Insert the new lines before the last 2nd line
      const indexToInsert = lines.length - 2;
      lines.splice(indexToInsert, 0, ...newLines);

      // Join lines back into a single string
      const newData = lines.join("\n");

      // Write the updated content to the file
      fs.writeFile(
        `/etc/apache2/sites-enabled/${domain}-le-ssl.conf`,
        newData,
        "utf8",
        (err) => {
          if (err) {
            console.error(`Error writing file: ${err.message}`);
            return;
          }

          // Reload Apache
          exec("systemctl reload apache2", (error, stdout, stderr) => {
            if (error) {
              console.error(`Error reloading apache2: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Error reloading apache2: ${stderr}`);
              return;
            }
          });
        }
      );
    }
  );
}

module.exports = { createServer, createSSL };
