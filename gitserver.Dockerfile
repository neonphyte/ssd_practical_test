FROM node:alpine

# Install tini and git, add user, configure git identity, and initialize repo in one RUN
RUN apk add --no-cache tini git \
    && yarn global add git-http-server \
    && adduser -D -g git git \
    && su git -c "git config --global user.name 'Ong Zhi Kang'" \
    && su git -c "git config --global user.email '2301862@sit.singaporetech.edu.sg'" \
    && su git -c "git init --bare /home/git/repository.git"

USER git
WORKDIR /home/git

ENTRYPOINT ["tini", "--", "git-http-server", "-p", "3000", "/home/git"]
