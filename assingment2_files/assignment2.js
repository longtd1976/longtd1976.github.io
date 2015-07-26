"use strict";

var gl;
var Gprogram = null;
var index = 0;
var verts = [];
var IsDrawing = false;
var Curr_p;
var maxNumVertices = 2000;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
	var Ui_new = document.getElementById("ui_new");
	var Ui_color = document.getElementById("ui_color");
	var Ui_width = document.getElementById("ui_width");
	var cindex;

	this.setWidth = function(){
		gl.lineWidth(Number(Ui_width.value));
	}
	this.setColor = function(){
		cindex = Number(Ui_color.value);
	}

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	Gprogram = program;
    gl.useProgram( program );

	Ui_new.onclick = newDrawing;
	Ui_color.onchange = this.setColor;
	Ui_width.onchange = this.setWidth;
	canvas.addEventListener("mousedown",
		function(event){
			IsDrawing = true;
			Curr_p = event2clip(event);
		}
	);
	canvas.addEventListener("mouseup",
		function(event){
			IsDrawing = false;
		}
	);
	canvas.addEventListener("mousemove",
		function(event){
			if (IsDrawing){
				var v = event2clip(event);
				verts.push(Curr_p, v);
				// Load the data into the GPU
				gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
				gl.bufferSubData( gl.ARRAY_BUFFER, 16*index, flatten(verts) );

				var t = vec4(colors[cindex]);
				gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 32*index, flatten(t));
				gl.bufferSubData(gl.ARRAY_BUFFER, 32*index+16, flatten(t));

				index++;
				render();
				verts.splice(0, verts.length);
				Curr_p = v;
			}
		}
	);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation( Gprogram, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

	this.setWidth();
	this.setColor();
	newDrawing();
}
function event2clip(event){
    var canvas = event.currentTarget; //! event.target is inappropriate
	var x = event.clientX - canvas.offsetLeft + window.pageXOffset; 
	var y = event.clientY - canvas.offsetTop + window.pageYOffset;
    return vec2(-1 + 2*x/canvas.width,
				-1 + 2*(canvas.height - y)/canvas.height);
}
function setColor(){
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, 2*index );

//    window.requestAnimFrame(render);
}

function newDrawing() {
    gl.clear( gl.COLOR_BUFFER_BIT );
	index = 0;
}
