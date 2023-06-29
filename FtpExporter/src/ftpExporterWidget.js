let $scope;

self.onInit = function() {
    self.ctx.ngZone.run(function() {
        init();
        self.ctx.detectChanges(true);
    });

};


function init() {

    $scope = self.ctx.$scope;
    
    const entityId = self.ctx.datasources[0].entity.id;

    $scope.connectionSuccessfull;
    $scope.isTestingConnection = false;
    
    const attributeService = $scope.$injector.get(self.ctx
        .servicesMap.get('attributeService'));
    const deviceService = $scope.$injector.get(self.ctx
        .servicesMap.get('deviceService'));
    const ftpService = $scope.$injector.get(self.ctx
        .servicesMap.get('ftpService'));
    const pageLink = self.ctx.pageLink(10);
    
    $scope.toastTargetId = 'file-exporter-widget';

    $scope.devices = [{
        name: 'All',
        id: -1
    }];

    if (self.ctx.datasources && self.ctx.datasources
        .length && self.ctx.datasources[0].type === 'entity'
        ) {
        let entityId = self.ctx.datasources[0].entityId;
        deviceService.getCustomerDeviceInfos(entityId,
            pageLink).subscribe(e => {
            e.data.forEach(element => {
                $scope.devices.push({
                    name: element.name,
                    id: element.id.id
                });
            });
        });
    }



    $scope.scheduleEventFormGroup = $scope.fb.group({
        serverUrl: ['127.0.0.1'],
        port: [21],
        username: [],
        password: [],
        folder: ['/'],
        device: [$scope.devices[0].id],
        scheduleMethod: ['DAILY'],
        scheduleDay: ['1'],
        scheduleHour: [12],
        scheduleMinute: [30]


    });

    $scope.testConnection = function() {
        $scope.isTestingConnection = true;

        ftpService.testFtpConnection(
            $scope.scheduleEventFormGroup.value
            .serverUrl,
            $scope.scheduleEventFormGroup.value
            .port,
            $scope.scheduleEventFormGroup.value
            .username,
            $scope.scheduleEventFormGroup.value
            .password, { ignoreErrors: true }).subscribe(
                function (data){
                    $scope.connectionSuccessfull = true;
                    $scope.isTestingConnection = false;
                    self.ctx.detectChanges();
                },
                function (error) {
                    $scope.connectionSuccessfull = false;
                    $scope.isTestingConnection = false;
                    self.ctx.detectChanges();
                });
        
    }


    $scope.createEvent = function() {

        if (entityId.entityType === 'CUSTOMER') {
            
            let query;

            if ($scope.scheduleEventFormGroup.value.device === -1) {
                query = [];
            }else {
                query = [{ id : $scope.scheduleEventFormGroup.value.device,
                            entityType: 'DEVICE'}];
            }
            
            ftpService.scheduleEvent(
                entityId.id,
                $scope.scheduleEventFormGroup.value.serverUrl,
                $scope.scheduleEventFormGroup.value.port,
                $scope.scheduleEventFormGroup.value.username,
                $scope.scheduleEventFormGroup.value.password,
                query,
                $scope.scheduleEventFormGroup.value.folder,
                $scope.scheduleEventFormGroup.value.scheduleMethod,
                $scope.scheduleEventFormGroup.value.scheduleDay,
                $scope.scheduleEventFormGroup.value.scheduleHour,
                $scope.scheduleEventFormGroup.value.scheduleMinute
                ).subscribe(
                function (data){
                    $scope.showSuccessToast('Event scheduled', 1000, 'top', 'right', self.ctx.toastTargetId);
                    self.ctx.detectChanges();
                },
                function (error){
                    $scope.showErrorToast('Error', 1000, 'top', 'right', $scope.toastTargetId);
                    self.ctx.detectChanges();
                });
        }
    }
    
    $scope.cancelEvent = function () {
        
        ftpService.cancelScheduledEvent(entityId.id).subscribe(
            function (data){
                $scope.showSuccessToast('Event cancelled', 1000, 'top', 'right', self.ctx.toastTargetId);
                self.ctx.detectChanges();
            },
            function (error){
                $scope.showErrorToast('Error', 1000, 'top', 'right', $scope.toastTargetId);
                self.ctx.detectChanges();
            });
}
}

self.typeParameters = function() {
    return {
        maxDatasources: 1,
        dataKeysOptional: true,
        singleEntity: true
    }
}