window.onload = function(){
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
 
    // butt line cap (top line)
    context.beginPath();
    context.moveTo(200, canvas.height / 2 - 50);
    context.lineTo(canvas.width - 200, canvas.height / 2 - 50);
    context.lineWidth = 20;
    context.strokeStyle = "#0000ff"; // line color
    context.lineCap = "butt";
    context.stroke();

//    document.write("Hello, why not ZOIDBERG!?");
    
    var hexes = new Array(2);
    hexes[0]=[0,1]; //row 1
    hexes[1]=[0,1]; //row 2
    var numrows = 10;
    var numcols = 20;
    var size = 18;
    var s = size;                  //side length
    var h = Math.sin(Math.PI/6)*s; //height between s and top or bottom
    var r = Math.cos(Math.PI/6)*s; //radius to middle of side
    var b = s + 2*h;               //vertical bounding box height
    var a = 2 * r;                 //horizontal bounding box width

    for (var i = 0; i<numrows;i++){
        var row=i;
        for (var j=0;j<numcols;j++){
            var col=j;
            var localOriginX = col * (2 * r) + (row&1)*r;
            var localOriginY = row * (h + s);
            paintHex(context,localOriginX,localOriginY,size);
        };
    };
};

function paintHex(context, localOriginX, localOriginY, s) {
    var h = Math.sin(Math.PI/6)*s; //height between s and top or bottom
    var r = Math.cos(Math.PI/6)*s; //radius to middle of side
    var b = s + 2*h;               //vertical bounding box height
    var a = 2 * r;                 //horizontal bounding box width
    
    //draw hex <1,0> : top row, second hex from the left
    //var localOriginX = 1 * (2 * r) + (0&1)*r;
    //var localOriginY = 0 * (h + s);
    
    context.beginPath();
    context.moveTo(localOriginX+r  ,localOriginY); //top of hex, clockwise
    context.lineTo(localOriginX+2*r,localOriginY+h);
    context.lineTo(localOriginX+2*r,localOriginY+h+s);
    context.lineTo(localOriginX+r  ,localOriginY+h+s+h);
    context.lineTo(localOriginX    ,localOriginY+h+s);
    context.lineTo(localOriginX    ,localOriginY+h);
    context.lineTo(localOriginX+r  ,localOriginY);
    context.closePath();
    context.lineWidth=2;
    context.strokeStyle="#000000";
    context.fillStyle="#C09090"
    context.fill();
    context.stroke();
};
