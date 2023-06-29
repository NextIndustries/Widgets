self.onInit = function() {
    
    var pageLink = self.ctx.pageLink(100);
    $scope = self.ctx.$scope;
    
    var attributeService = $scope.$injector.get(self.ctx.servicesMap.get('attributeService'));
    var deviceService = $scope.$injector.get(self.ctx.servicesMap.get('deviceService'));
    
console.log(self.ctx);

async function getEntityId() {
  self.ctx.$scope.datasources = self.ctx.defaultSubscription.datasources;
  var entityId = await self.ctx.$scope.datasources[0].entityId;
  console.log(entityId);
  return entityId;
}

async function getDevices() {
  var entityId = await getEntityId();
  deviceService.getCustomerDeviceInfos(entityId, pageLink).subscribe(e => {
      console.log(e);
  });
}

getDevices();
    
    self.ctx.$scope.sendCommand = function() {
        var serverUrl = self.ctx.$scope.serverUrl;
        var folder = self.ctx.$scope.folder;
        var username = self.ctx.$scope.username;
        var password = self.ctx.$scope.password;
        var port = self.ctx.$scope.port;
        var tries = self.ctx.$scope.tries;
        var selectedMethod = 'DAILY';
        var selectedHour = self.ctx.$scope.selectedHour;
        var selectedMinute = self.ctx.$scope.selectedMinute;

        var entityId = self.ctx.datasources[0].entity.id;
        console.log(self.ctx.datasources[0]);
        

        if(entityId.entityType === 'CUSTOMER') {

            attributeService.saveEntityAttributes(
                entityId,
                'SERVER_SCOPE',
                [
                    {
                        key: 'url',
                        value: serverUrl
                    },
                    {
                        key: 'folder',
                        value: folder
                    },
                    {
                        key: 'username',
                        value: username
                    },
                    {
                        key: 'password',
                        value: password
                    },
                    {
                        key: 'port',
                        value: port
                    },
                    {
                        key: 'tries',
                        value: tries
                    },
                    {
                        key: 'selectedMethod',
                        value: selectedMethod
                    },
                    {
                        key: 'selectedHour',
                        value: selectedHour
                    },
                    {
                        key: 'selectedMinute',
                        value: selectedMinute
                    }

                ]
            ).subscribe(
                function success() {
                    console.log("success");
                },
                function fail() {
                    console.log("fail");
                }
            );
        }
    }
}

self.typeParameters = function() {
    return {
        maxDatasources: 1,
        dataKeysOptional: true,
        singleEntity: true
    }
}

self.onDataUpdated = function() {
        self.ctx.detectChanges();
    }