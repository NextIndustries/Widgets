self.onInit = function() {
    
  self.ctx.$scope.sendCommand = function() {
      var url = self.ctx.$scope.url;
      var port = self.ctx.$scope.port;
      var username = self.ctx.settings.username;
      var password = self.ctx.settings.password;
      var tries = self.ctx.settings.tries;
      var scheduleMethod = self.ctx.settings.scheduleMethod;
      var scheduleHour = self.ctx.settings.scheduleHour;
      var scheduleMinute = self.ctx.settings.scheduleMethod;

      $scope.editEntityFormGroup = $scope.fb.group({
        url: [undefined, validators],
        port: [undefined, validators],
        username: [undefined, validators],
        password: [undefined, validators],
        tries: [undefined, validators]
    });

      // var oneWayElseTwoWay = self.ctx.settings.oneWayElseTwoWay ? true : false;

      // var commandObservable;
      // if (oneWayElseTwoWay) {
      //     commandObservable = self.ctx.controlApi.sendOneWayCommand(rpcMethod, rpcParams, timeout);
      // } else {
      //     commandObservable = self.ctx.controlApi.sendTwoWayCommand(rpcMethod, rpcParams, timeout);
      // }
      // commandObservable.subscribe(
      //     function (response) {
      //         if (oneWayElseTwoWay) {
      //             self.ctx.$scope.rpcCommandResponse = "Command was successfully received by device.<br> No response body because of one way command mode.";
      //         } else {
      //             self.ctx.$scope.rpcCommandResponse = "Response from device:<br>";                    
      //             self.ctx.$scope.rpcCommandResponse += JSON.stringify(response, undefined, 2);
      //         }
      //         self.ctx.detectChanges();
      //     },
      //     function (rejection) {
      //         self.ctx.$scope.rpcCommandResponse = "Failed to send command to the device:<br>"
      //         self.ctx.$scope.rpcCommandResponse += "Status: " + rejection.status + "<br>";
      //         self.ctx.$scope.rpcCommandResponse += "Status text: '" + rejection.statusText + "'";
      //         self.ctx.detectChanges();
      //     }
          
      // );
  }
  
}