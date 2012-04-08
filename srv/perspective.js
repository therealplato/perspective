//Client half of Perspective using Sexygrid by plato 04.06.12

(function() {
var ctx={};

hexClicked = function(h0) {
    Sexy.socket.emit('hexClicked',{y:h0.center.y,
                               z:h0.center.z});
    console.log('Hex at ('+h0.center.y+','+
                           h0.center.z+') clicked');
    var docy=document.getElementById("docy");
    var docz=document.getElementById("docz");
    docy.innerHTML=h0.center.y;
    docz.innerHTML=h0.center.z;
};


draw = function() {
    bgL.draw();
    hexL.draw();
};

window.onload=function(){
//initial conditions
ctx.stage     = new Kinetic.Stage("kstage",600,600);
ctx.bgL       = new Kinetic.Layer("grid");
ctx.hexL      = new Kinetic.Layer("hexes");
ctx.linkL     = new Kinetic.Layer("links");
ctx.noteL     = new Kinetic.Layer("notes");
ctx.stage.add(ctx.bgL);      ctx.stage.add(ctx.hexL); 
ctx.stage.add(ctx.linkL);    ctx.stage.add(ctx.noteL); 

ctx.grid = Sexy.Grid(10,10); //this returns Sexy.hexes
for(var m=-10;m<11;m++) {
    for(var n=-10;n<11;n++) {
        var thisHex=ctx.grid[m.toString()][n.toString()]
        if(thisHex != null){
            thisHex['kinshape']= new Kinetic.RegularPolygon({
                x:Sexy.pq2xy(m,n)['x'],
                y:Sexy.pq2xy(m,n)['y'],
                myHex:thisHex,
                sides: 6,
                radius: Sexy.r(),
                fill: "#FFFFFF",
                stroke: "black",
                strokeWidth: 1,
            }); 
            thisHex['kinshape'].onClick=hexClicked(this.myHex);
        };
    };
};
//a=ctx.grid.addNode={'p':3,'q':3,'height':4};
//b=ctx.grid.addNode={'p':3,'q':3,'height':5};

//Define our grid of vertices and place background grid
/*for(var m=-11;m<11;m++) {
    ctx.verts[m.toString()]={};
    for(var n=-11;n<11;n++) {
        Sexy.verts[m.toString()][n.toString()]=new Vertex(m,n);
        if(getVertex(m,n).hexPhase()==true) {
            if(Sexy.hexes[m.toString()]==undefined) {Sexy.hexes[m.toString()]={}};
            Sexy.hexes[m.toString()][n.toString()]=new Hex(getVertex(m,n));
            shape=getHex(m,n)['kinshape'];
            shape.setFill("#efefef");
            shape.setStroke("#bbbbbb");
            shape.on("click", function(){
                Sexy.hexClicked(this.myHex);
            });
            Sexy.bgL.add(shape); 
        };            
    };        
};*/

console.log(getHex(0,0));

Sexy.bgL.draw();
Sexy.hexL.draw()
Sexy.linkL.draw();
}; //end of window.onload()
})();
