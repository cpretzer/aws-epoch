#! /bin/bash

sudo apt update
curl -fsSL https://get.pulumi.com | sh

go version
${HOME}/.pulumi/bin/pulumi version

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

# in lieu of restarting the shell
\. "/usr/local/share/nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.14.0".
nvm current # Should print "v22.14.0".

# Verify pnpm version:
npm -v

alias p='pulumi'
alias pst='pulumi stack'
alias p='pulumi'