FROM node:alpine

RUN apk add --no-cache tini git \
    && yarn global add git-http-server \
    && adduser -D -g git git

USER git
WORKDIR /home/git

# Configure Git user identity globally for the 'git' user
RUN git config --global user.name "Ong Zhi Kang" && \
    git config --global user.email "2301862@sit.singaporetech.edu.sg"


RUN git init --bare repository.git

ENTRYPOINT ["tini", "--", "git-http-server", "-p", "3000", "/home/git"]
