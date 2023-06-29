let $scope;

self.onInit = function() {
    self.ctx.ngZone.run(function() {
       init(); 
       self.ctx.detectChanges(true);
    });
    
};


function init() {

    $scope = self.ctx.$scope;
    
    const attributeService = $scope.$injector.get(self.ctx.servicesMap.get('attributeService'));
    const deviceService = $scope.$injector.get(self.ctx.servicesMap.get('deviceService'));
    const pageLink = self.ctx.pageLink(50);
    
    
    $scope.devices = [{name: 'All', id: "-1"}];
    
    if (self.ctx.datasources && self.ctx.datasources.length && self.ctx.datasources[0].type === 'entity') {
        let entityId = self.ctx.datasources[0].entityId;
        let device = [];
        deviceService.getCustomerDeviceInfos(entityId, pageLink).subscribe(e => {
    e.data.forEach(element => {
        $scope.devices.push({name: element.name, id: element.id.id});
    });
});
    }
    
    

    $scope.attributeUpdateFormGroup = $scope.fb.group({
        serverUrl: ['127.0.0.1'],
        port: [21],
        username: [],
        password: [],
        folder: [],
        tries: [3],
        device: [$scope.devices[0].id],
        scheduleMethod: ['DAILY'],
        scheduleDay: ['1'],
        scheduleHour: [12],
        scheduleMinute: [30]

        
    });
    
    console.log($scope.attributeUpdateFormGroup);
    
    

    $scope.updateAttribute = function () {
        
        const entityId = self.ctx.datasources[0].entity.id;
        
        if(entityId.entityType === 'CUSTOMER') {

            attributeService.saveEntityAttributes(
                entityId,
                'SERVER_SCOPE',
                [
                    {
                        key: 'url',
                        value: $scope.attributeUpdateFormGroup.value.serverUrl
                    },
                    {
                        key: 'folder',
                        value: $scope.attributeUpdateFormGroup.value.folder
                    },
                    {
                        key: 'username',
                        value: $scope.attributeUpdateFormGroup.value.username
                    },
                    {
                        key: 'password',
                        value: $scope.attributeUpdateFormGroup.value.password
                    },
                    {
                        key: 'port',
                        value: $scope.attributeUpdateFormGroup.value.port
                    },
                    {
                        key: 'tries',
                        value: $scope.attributeUpdateFormGroup.value.tries
                    },
                    {
                        key: 'deviceId',
                        value: $scope.attributeUpdateFormGroup.value.device
                    },
                    {
                        key: 'scheduleMethod',
                        value: $scope.attributeUpdateFormGroup.value.scheduleMethod
                    },
                    {
                        key: 'scheduleDay',
                        value: $scope.attributeUpdateFormGroup.value.scheduleDay
                    },
                    {
                        key: 'scheduleHour',
                        value: $scope.attributeUpdateFormGroup.value.scheduleHour
                    },
                    {
                        key: 'scheduleMinute',
                        value: $scope.attributeUpdateFormGroup.value.scheduleMinute
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


self.onDestroy = function() {

}

self.typeParameters = function() {
    return {
        maxDatasources: 1,
        dataKeysOptional: true,
        singleEntity: true
    }
}