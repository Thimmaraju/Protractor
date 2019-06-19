FROM ubuntu:16.04

RUN apt-get update \
    && apt-get install \
    && apt-get -qqy install \
    default-jre \
    sudo \
    curl \
    wget \
    git \
    python-pip

RUN pip install requests

# Install Node.js and npm
RUN curl --silent --location https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN apt-get install -y nodejs

# Install protractor and selenium webdriver
RUN npm install -g protractor \
    &&  webdriver-manager update


# Install required packages
RUN apt-get -qqy install \
  libxpm4 \
  libxrender1 \
  libgtk2.0-0 \
  libnss3 \
  libgconf-2-4 \
  libappindicator1 \
  fonts-liberation \
  gtk2-engines-pixbuf \
  xfonts-cyrillic \
  xfonts-100dpi \
  xfonts-75dpi \
  xfonts-base \
  xfonts-scalable \
  imagemagick \
  x11-apps \
  libxss1 \
  xdg-utils \
  xvfb

# Install Goodle Chrome
#RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
#RUN wget https://github.com/webnicer/chrome-downloads/raw/master/x64.deb/google-chrome-stable_65.0.3325.146-1_amd64.deb \
#  && sudo dpkg -i google-chrome-stable_65.0.3325.146-1_amd64.deb \
#  && apt-get clean \
#  && rm -rf /var/lib/apt/lists/* \
#  && rm google-chrome-stable_65.0.3325.146-1_amd64.deb

#Install most stable Google Chrome
#RUN curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add
#RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
#RUN apt-get -y update
#RUN apt-get -y install google-chrome-stable=67.0.3396.99-1

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
RUN sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN sudo apt-get update
RUN sudo apt-get install google-chrome-stable


#Install S3cmd
RUN wget -O- -q http://s3tools.org/repo/deb-all/stable/s3tools.key | sudo apt-key add -
RUN sudo wget -O/etc/apt/sources.list.d/s3tools.list http://s3tools.org/repo/deb-all/stable/s3tools.list
RUN sudo apt-get -y update && sudo apt-get -y install s3cmd && sudo apt-get -y install zip unzip

WORKDIR /media/cb-consume-ui-automation
COPY . /media/cb-consume-ui-automation/
RUN chmod -Rf 777 .

RUN export CHROME_BIN=chromium-browser \
    && export DISPLAY=:99.0 \
    && npm install

RUN node -v
RUN npm -v
RUN protractor --version
RUN npm view jasmine version
RUN npm -y install jasmine2-protractor-utils -g
RUN npm -y install -g junit-merge
RUN npm install

RUN lsb_release -a
RUN ls -al /usr/bin/google-chrome
RUN webdriver-manager update
RUN webdriver-manager version
RUN webdriver-manager status

RUN ls -al
RUN pwd
# Container entry point
CMD ["/bin/bash", "protractor.sh"]
