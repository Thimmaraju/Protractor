#!/bin/bash

set -o errexit
set -o nounset
namespace="$3"
echo $namespace
docker -v
docker ps -a | grep 'cb-consume-ui-automation' | awk '{print $1}' | xargs --no-run-if-empty docker rm -f
docker login -u "$1" -p "$2" ibmcb-docker-local.artifactory.swg-devops.com
docker pull ibmcb-docker-local.artifactory.swg-devops.com/cb-consume-ui-automation
docker run --rm -e "NAMESPACE=$namespace" --name cb-consume-ui-automation ibmcb-docker-local.artifactory.swg-devops.com/cb-consume-ui-automation