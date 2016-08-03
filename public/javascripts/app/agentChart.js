
    var chart = new CanvasJS.Chart("dashboard", {            
      title:{
        text: "Fruits sold in First & Second Quarter"              
      },

      data: [  //array of dataSeries     
      { //dataSeries - first quarter
   /*** Change type "column" to "bar", "area", "line" or "pie"***/        
       type: "column",
       name: "First Quarter",
       dataPoints: [
       { label: "banana", y: 18 },
       { label: "orange", y: 29 },
       { label: "apple", y: 40 },                                    
       { label: "mango", y: 34 },
       { label: "grape", y: 24 }
       ]
     },
     { //dataSeries - second quarter

      type: "column",
      name: "Second Quarter",                
      dataPoints: [
      { label: "banana", y: 23 },
      { label: "orange", y: 33 },
      { label: "apple", y: 48 },                                    
      { label: "mango", y: 37 },
      { label: "grape", y: 20 }
      ]
    }
    ]
  });

    chart.render();