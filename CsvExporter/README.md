# CSV File Downloader for Multiple Sensor Values

The following documentation provides an overview and usage instructions for a widget that creates a CSV file for multiple sensor values with dates.

## Overview

The widget action allows users to select multiple sensor values and a date range. It then generates a CSV file containing the selected sensor values along with their corresponding dates. The generated CSV file can be downloaded for further analysis or data processing.

### Interface

![image](https://github.com/NextIndustries/csvDownloader/assets/57275553/e4abfe88-b122-4fe5-9c7d-f417537caf66)

### Format

![12](https://github.com/NextIndustries/csvDownloader/assets/134918739/8a5959cb-258a-46a3-83db-f62fb2eb8b01)

## Usage
Import widget bungle : ![csv_downloader](https://github.com/NextIndustries/csvDownloader/blob/main/Widget/csv_downloader.json)




## Dependencies

### Attribute Service 
Refers to a service that deals with attributes and fetches data from the server.

### Import Export Service 
Refers to a service that facilitates the importation or exportation of data in a specific format or data type.

```javascript
let $injector = widgetContext.$scope.$injector;
let attributeService = $injector.get(widgetContext.servicesMap.get('attributeService'));
let importExportService = $injector.get(widgetContext.servicesMap.get('importExport'));
```

## Code Flow
![csvDownloader](https://github.com/NextIndustries/csvDownloader/assets/134918739/b4b1e639-975d-4139-b4fd-cda2f169d360)

