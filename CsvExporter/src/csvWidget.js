const limit = 500;

self.onInit = function () {
    self.ctx.ngZone.run(function () {
        init();
        self.ctx.detectChanges(true);
    });

};

function init() {

    const $scope = self.ctx.$scope;
    
    const attributeService = $scope.$injector.get(self.ctx.servicesMap.get('attributeService'));
    const importExportService = $scope.$injector.get(self.ctx.servicesMap.get('importExport'));
    const deviceService = $scope.$injector.get(self.ctx.servicesMap.get('deviceService'));
    const entityService = $scope.$injector.get(self.ctx.servicesMap.get('entityService'));

    const pageLink = self.ctx.pageLink(10);
    
    $scope.devices = [];

    $scope.startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    $scope.endTime = new Date(); // Now

    if (self.ctx.datasources && self.ctx.datasources
        .length && self.ctx.datasources[0].type === 'entity'
    ) {
        const entityId = self.ctx.datasources[0].entityId;
        deviceService.getCustomerDeviceInfos(entityId,
            pageLink).subscribe(device => {
                device.data.forEach(element => {
                    entityService.getEntityKeys(element.id, '', 'timeseries').subscribe(e => {
                       if(e.length === 0){
                           e.push('None');
                       }else{
                           e.unshift('All');
                       }
                       
                       $scope.devices.push({
                        name: element.name,
                        id: element.id,
                        dataKeys: e
                        });
                        $scope.selectedDevice = $scope.devices[0];
                        $scope.attributeUpdateFormGroup.get('device').setValue($scope.selectedDevice.id);
                        $scope.attributeUpdateFormGroup.get('timeseriesKey').setValue($scope.selectedDevice.dataKeys[0]);
                    });
                });
            });
    }

    $scope.attributeUpdateFormGroup = $scope.fb.group({
        device: [],
        startTime: [$scope.startTime],
        endTime: [$scope.endTime],
        timeseriesKey: []
    });


    self.ctx.$scope.onDeviceSelected = function () {
        $scope.selectedDevice = $scope.devices.find(device => device.id === $scope.attributeUpdateFormGroup.get('device').value);
        $scope.attributeUpdateFormGroup.get('timeseriesKey').setValue($scope.selectedDevice.dataKeys[0]);
    };

    self.ctx.$scope.onSubmit = function () {

        if ($scope.attributeUpdateFormGroup.value.timeseriesKey === 'All') {
            $scope.attributeUpdateFormGroup.value.timeseriesKey = $scope.selectedDevice.dataKeys
            .filter(key => key !== 'All');
        }else {
            $scope.attributeUpdateFormGroup.value.timeseriesKey = [$scope.attributeUpdateFormGroup.value.timeseriesKey];
        }

        if($scope.attributeUpdateFormGroup.value.timeseriesKey !== 'None'){
            attributeService.getEntityTimeseries(
            $scope.attributeUpdateFormGroup.value.device, 
            $scope.attributeUpdateFormGroup.value.timeseriesKey,
            $scope.attributeUpdateFormGroup.value.startTime.getTime(), 
            $scope.attributeUpdateFormGroup.value.endTime.getTime(), 
            limit).subscribe(function (data) {
                data.entityId = $scope.selectedDevice.id;
                data.entityName = $scope.selectedDevice.name;
                    exportCsv([data], 'file');
              
            });
        }
        
    };

    function exportCsv(data, filename) {
        const CSV_TYPE = { extension: 'csv', mimeType: 'text/csv' };
        let colsHead;
        let colsData;

        if (data && data.length) {
            const dataKeys = Object.keys(data[0]).filter(key => key !== 'entityName' && key !== 'entityId');
            colsHead = `timestamp,date,entityId,entityName,${dataKeys.join(',')}`;

            colsData = data.flatMap(obj => {
                const entityName = obj.entityName;
                const entityId = obj.entityId;
                const timestamps = {};

                dataKeys.forEach(key => {
                    if (Array.isArray(obj[key])) {
                        obj[key].forEach(temp => {
                            const { ts, value } = temp;
                            const date = new Date(ts).toISOString();
                            const rowKey = `${ts}`;

                            if (!timestamps[rowKey]) {
                                timestamps[rowKey] = {
                                    timestamp: ts,
                                    date: date,
                                    entityId,
                                    entityName
                                };
                                dataKeys.forEach(k => (timestamps[rowKey][k] = ''));
                            }

                            timestamps[rowKey][key] = value;
                        });
                    }
                });

                return Object.values(timestamps).map(row => {
                    const rowData = [row.timestamp, row.date, row.entityId, row.entityName].concat(
                        dataKeys.map(key => row[key])
                    );
                    return rowData.join(',');
                });
            });
        } else {
            colsHead = '';
            colsData = [];
        }

        const csvData = `${colsHead}\n${colsData.join('\n')}`;
        importExportService.downloadFile(csvData, filename, CSV_TYPE);
    }

}

self.typeParameters = function () {
    return {
        dataKeysOptional: true,
        singleEntity: false
    }
}