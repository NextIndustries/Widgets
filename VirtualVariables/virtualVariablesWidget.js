self.onInit = function () {
    self.ctx.ngZone.run(function () {
        init();
        self.ctx.$scope.data = self.ctx.defaultSubscription.data;
        self.ctx.detectChanges(true);
    });

};

function init() {
    
    console.log(self.ctx);
    
    const entityId = self.ctx.datasources[0].entity.id;

    const $scope = self.ctx.$scope;
    const attributeService = $scope.$injector.get(self.ctx.servicesMap.get('attributeService'));
    const entityService = $scope.$injector.get(self.ctx.servicesMap.get('entityService'));

    if (self.ctx.datasources[0].entityType === 'DEVICE') {

        entityService.getEntityKeys(entityId, '', 'timeseries').subscribe(e => {
            console.log(e);
            $scope.vVariableFormGroup.get('keys').setValue([...e]);
            console.log($scope.vVariableFormGroup.value.keys);
        });
        
            const jsonObject = {"isVirtual": true, "variables" : [
                {
                    'vtemperature': 'test'
                }
            ]};
            const testVar = JSON.stringify(jsonObject);
            console.log(testVar);
            attributeService.saveEntityAttributes(entityId,'SERVER_SCOPE',[{key: 'virtual_variables', value:testVar }]
                
            ).subscribe(e => {
                console.log(e);
            })
            
            
            attributeService.getEntityAttributes(entityId,'SERVER_SCOPE').subscribe(e => {
                console.log(e);
            })
    }

    $scope.vVariableFormGroup = $scope.fb.group({
        keys: [],
        calc: []
    });
    
    self.ctx.$scope.onSubmit = function () {
        
    };

}

self.typeParameters = function () {
    return {
        dataKeysOptional: false,
        singleEntity: false
    }
}

self.onDataUpdated = function() {
        self.ctx.detectChanges();
    }