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


    $scope.devices = [];

    $scope.startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    $scope.endTime = new Date(); // Now


    if (self.ctx.datasources && self.ctx.datasources.length) {
        self.ctx.datasources.forEach(e => {
            const dataKeys = e.dataKeys.map(d => ({ name: d.name }));
            dataKeys.unshift({ name: 'All' });

            $scope.devices.push({
                name: e.name,
                id: e.entityId,
                dataKeys: dataKeys
            });
        });
    }

    $scope.selectedDevice = $scope.devices[0];

    $scope.attributeUpdateFormGroup = $scope.fb.group({
        device: [$scope.selectedDevice.id],
        startTime: [$scope.startTime],
        endTime: [$scope.endTime],
        timeseriesKey: ['All']
    });


    self.ctx.$scope.onDeviceSelected = function () {
        $scope.selectedDevice = $scope.devices.find(device => device.id === $scope.attributeUpdateFormGroup.get('device').value);
    };

    self.ctx.$scope.onSubmit = function () {

        if ($scope.attributeUpdateFormGroup.value.timeseriesKey === 'All') {
            $scope.attributeUpdateFormGroup.value.timeseriesKey = $scope.selectedDevice.dataKeys
            .filter(device => device.name !== 'All')
            .map(device => device.name);
        } else {
            $scope.attributeUpdateFormGroup.value.timeseriesKey = [$scope.attributeUpdateFormGroup.value.timeseriesKey];
        }

        attributeService.getEntityTimeseries(
            { id: $scope.selectedDevice.id, entityType: 'DEVICE' }, 
            $scope.attributeUpdateFormGroup.value.timeseriesKey,
            $scope.attributeUpdateFormGroup.value.startTime.getTime(), 
            $scope.attributeUpdateFormGroup.value.endTime.getTime(), 
            limit).subscribe(function (data) {
                data.entityId = $scope.selectedDevice.id;
                data.entityName = $scope.selectedDevice.name;
                    exportCsv([data], 'file');
              
            });
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
        dataKeysOptional: false,
        singleEntity: false
    }
}