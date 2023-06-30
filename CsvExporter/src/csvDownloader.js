// Widget Code
// Joins all timeseries data with timestamps for creating a csv file

let $injector = widgetContext.$scope.$injector;
let customDialog = $injector.get(widgetContext.servicesMap.get('customDialog'));
let attributeService = $injector.get(widgetContext.servicesMap.get('attributeService'));
let importExportService = $injector.get(widgetContext.servicesMap.get('importExport'));

const dataKeysNames = widgetContext.datasources[0].dataKeys.map(dataKey => dataKey.name);

openEditEntityDialog();

function openEditEntityDialog() {
  customDialog.customDialog(htmlTemplate, EditEntityDialogController).subscribe();
}

function EditEntityDialogController(instance) {
  let vm = instance;

  vm.entityNames = [];

  vm.timeseriesKeys = ['all', ...dataKeysNames];

  vm.entityName = entityName;
  vm.entityNames.push(entityName);
  vm.startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  vm.endTime = new Date();
  vm.timeseriesKey = vm.timeseriesKeys[0];

  vm.editEntityFormGroup = vm.fb.group({
    entityName: [vm.entityName, [vm.validators.required]],
    startTime: [vm.startTime, [vm.validators.required]],
    endTime: [vm.endTime, [vm.validators.required]],
    timeseriesKey: [vm.timeseriesKey, [vm.validators.required]]
  });

  vm.cancel = function() {
    vm.dialogRef.close(null);
  };

  vm.save = function() {

    if (vm.editEntityFormGroup.value.timeseriesKey === 'all') {
      vm.editEntityFormGroup.value.timeseriesKey = dataKeysNames;
    } else {
      vm.editEntityFormGroup.value.timeseriesKey = [vm.editEntityFormGroup.value.timeseriesKey];
    }

    getCsv(vm);
  };
}

function getCsv(vm) {
  let testData = [];
  attributeService.getEntityTimeseries(entityId, vm.editEntityFormGroup.value.timeseriesKey,
    vm.editEntityFormGroup.value.startTime.getTime(), vm.editEntityFormGroup.value.endTime.getTime()).subscribe(function (data) {
      data.entityId = entityId.id;
      data.entityName = entityName;
      testData.push(data);
      if (testData.length > 0) {
        exportCsv(testData, 'file');
      }
    });
}

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
