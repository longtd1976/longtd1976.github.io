"use strict";

var canvas;
var gl;
var bufferId;

var draw_pen_width;
var draw_color;
var fColor;
const black = vec4(0.0, 0.0, 0.0, 1.0);
var segments=[];
var points = [];
var IsDrawing = false;
var clRed = 0;
var clGreen = 0;
var clBlue = 0;

function segment(points,color){
  this.points=points;      
  this.color=color;
}

window.onload = function init() {
    var clrCmd = document.getElementById("clear_canvas");
    canvas = document.getElementById( "gl-canvas" );
    clrCmd.onclick = ClearCanvas;
    canvas.addEventListener("mousedown",OnMousePressed);
    canvas.addEventListener("mouseup",OnMouseReleased);
    canvas.addEventListener("mousemove",OnMouseMove);
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    // gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );

    fColor = gl.getUniformLocation(program,"fColor");
     
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function OnMouseReleased(){
  IsDrawing=false;
}

function OnMouseMove(event){
  if (IsDrawing) {
    var t = toCanvasCoord(event);
    draw(t);
  }
}

function draw(point){
  var seg=segments[segments.length-1];
  var points=seg.points;
  points.push(point);  
}

function ClearCanvas() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  points.length = 0;
}
function PenWidthUpdate(value){
  draw_pen_width=value;  
}
function UpdateClRed(value){
  clRed=value/255.0;
}
function UpdateClGreen(value){
  clGreen=value/255.0;
}
function UpdateClBlue(value){
  clBlue=value/255.0;  
}

function OnMousePressed(event){
  var points=[];
  var point=toCanvasCoord(event);
  points.push(point);
  var col=[clRed,clGreen,clBlue];
  var seg=new segment(points,col);
  segments.push(seg);
  IsDrawing=true;
 
}

function toCanvasCoord(event) {
  var x = event.clientX - canvas.offsetLeft + window.pageXOffset; 
	var y = event.clientY - canvas.offsetTop + window.pageYOffset;
  return vec2(-1 + 2 * x / canvas.width, -1 + 2 * (canvas.height - y) / canvas.height);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform4fv(fColor, flatten(black));
  
  for (var i = 0; i < segments.length; i++) {
     var seg=segments[i];
     var points = seg.points;
     var col=vec4(seg.color[0],seg.color[1],seg.color[2],1.0);
     gl.uniform4fv(fColor, flatten(col));
     gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
     gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );    
     gl.drawArrays(gl.LINE_STRIP, 0, points.length);
  }
  
  requestAnimFrame(render);
}