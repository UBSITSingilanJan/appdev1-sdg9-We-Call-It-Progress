Project Title: We Call It Progress
SGD Chosen: SDG 9 - Industry, Innovation, and Infrastructure
Group Members:
  - Leonard Sagudin - Data Engineer
  - Jan Singilan - UI Developer
  - Cristina Perido - Project Lead
Local Setup Instructions:
  -clone
  -npm install -g npm@12.11.1
  -npm install -g @angular/cli
  -delete package-lock.json
  -npm install
  -download nvm at: https://github.com/coreybutler/nvm-windows/releases
  -nvm install 22
  -nvm use 22
  -node -v (should see v22.x.x)
  -npm uninstall tailwindcss @tailwindcss/postcss
  -npm install -D tailwindcss@3.4.17 postcss autoprefixer
  -rmdir /s /q node_modules
  -rmdir /s /q .angular
  -del package-lock.json
  -npm install
  -ng serve --open
