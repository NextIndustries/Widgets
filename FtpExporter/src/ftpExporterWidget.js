let $scope;

self.onInit = function () {
    self.ctx.ngZone.run(function () {
        init();
        self.ctx.detectChanges(true);
    });

};


function init() {
    
    console.log(self);

    $scope = self.ctx.$scope;
    const entityId = self.ctx.datasources[0].entity.id;
    
    let userId;
    if(self.ctx.currentUser.authority === 'CUSTOMER_USER'){
        userId = {entityType: 'USER', id: self.ctx.currentUser.userId};
    }
    
    $scope.connectionSuccessfull;
    $scope.isTestingConnection = false;
    $scope.scheduleData;

    $scope.toastTargetId = 'file-exporter-widget';
    $scope.devices = [{
        name: 'All',
        id: -1
    }];

    const attributeService = $scope.$injector.get(self.ctx
        .servicesMap.get('attributeService'));
    const deviceService = $scope.$injector.get(self.ctx
        .servicesMap.get('deviceService'));
    const ftpService = $scope.$injector.get(self.ctx
        .servicesMap.get('ftpService'));
    const pageLink = self.ctx.pageLink(10);

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

    getData();
    fetchForm();

    $scope.testConnection = function () {
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
                    function (data) {
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


    $scope.createEvent = function () {

        if (entityId.entityType === 'CUSTOMER') {

            let query;

            if ($scope.scheduleEventFormGroup.value.device === -1) {
                query = [];
            } else {
                query = [{
                    id: $scope.scheduleEventFormGroup.value.device,
                    entityType: 'DEVICE'
                }];
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
                function (data) {
                    $scope.showSuccessToast('Event scheduled', 1000, 'top', 'right', self.ctx.toastTargetId);
                    getData();
                    if(userId){
                        attributeService.saveEntityAttributes(
                        userId,
                        'SERVER_SCOPE',
                        [
                            {
                                key: 'ftp_details', value: {
                                    serverUrl: $scope.scheduleEventFormGroup.value.serverUrl,
                                    port: $scope.scheduleEventFormGroup.value.port,
                                    username: $scope.scheduleEventFormGroup.value.username,
                                    password: $scope.scheduleEventFormGroup.value.password,
                                    query: query,
                                    folder: $scope.scheduleEventFormGroup.value.folder,
                                    scheduleMethod: $scope.scheduleEventFormGroup.value.scheduleMethod,
                                    scheduleDay: $scope.scheduleEventFormGroup.value.scheduleDay,
                                    scheduleHour: $scope.scheduleEventFormGroup.value.scheduleHour,
                                    scheduleMinute: $scope.scheduleEventFormGroup.value.scheduleMinute
                                }
                            }]
                    ).subscribe();
                    }
                    
                    self.ctx.detectChanges();
                },
                function (error) {
                    $scope.showErrorToast('Error', 1000, 'top', 'right', $scope.toastTargetId);
                    self.ctx.detectChanges();
                });
        }
    }

    $scope.cancelEvent = function () {

        ftpService.cancelScheduledEvent(entityId.id).subscribe(
            function (data) {
                $scope.showSuccessToast('Event cancelled', 1000, 'top', 'right', self.ctx.toastTargetId);
                $scope.connectionSuccessfull = null;
                getData();
                self.ctx.detectChanges();
            },
            function (error) {
                $scope.showErrorToast('Error', 1000, 'top', 'right', $scope.toastTargetId);
                self.ctx.detectChanges();
            });
    }

    function getData() {
        ftpService.getScheduledEvent(entityId.id).subscribe(
            function (data) {
                if (data['Result'] !== '') {
                    const myData = JSON.parse(data['Result']);

                    if (myData.method === 'DAILY') {
                        $scope.scheduleData = myData.method +
                            ' Hour: ' + myData.hour +
                            ' Minute: ' + myData.minute +
                            ' Devices: ' + myData.deviceList;
                    } else if (myData.method === 'WEEKLY') {
                        let dayOfWeek = '';
                        switch (myData.day) {
                            case 1:
                                dayOfWeek = 'Monday';
                                break;
                            case 2:
                                dayOfWeek = 'Tuesday';
                                break;
                            case 3:
                                dayOfWeek = 'Wednesday';
                                break;
                            case 4:
                                dayOfWeek = 'Thursday';
                                break;
                            case 5:
                                dayOfWeek = 'Friday';
                                break;
                            case 6:
                                dayOfWeek = 'Saturday';
                                break;
                            case 7:
                                dayOfWeek = 'Sunday';
                                break;
                            default:
                                dayOfWeek = '';
                                break;
                        }

                        $scope.scheduleData = myData.method +
                            ' Day: ' + dayOfWeek +
                            ' Hour: ' + myData.hour +
                            ' Minute: ' + myData.minute +
                            ' Devices: ' + myData.deviceList;

                    } else {

                        $scope.scheduleData = myData.method +
                            ' Day: ' + myData.day +
                            ' Hour: ' + myData.hour +
                            ' Minute: ' + myData.minute +
                            ' Devices: ' + myData.deviceList;
                    }
                } else {
                    $scope.scheduleData = null;
                }
                self.ctx.detectChanges();
            },
            function (error) {
                console.log(error);
            });
    }

    function fetchForm() {

        if (entityId.entityType === 'CUSTOMER' && userId) {

            attributeService.getEntityAttributes(
                userId,
                'SERVER_SCOPE',
                ['ftp_details']
            ).subscribe(
                function success(data) {
                    $scope.scheduleEventFormGroup.patchValue({
                        serverUrl: data[0].value.serverUrl,
                        port: data[0].value.port,
                        username: data[0].value.username,
                        password: data[0].value.password,
                        folder: data[0].value.folder,
                    });
                },
                function fail(error) {
                    console.log(error);
                }
            );


        }
    }
}

self.typeParameters = function () {
    return {
        maxDatasources: 1,
        dataKeysOptional: true,
        singleEntity: true
    }
}