"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 1;
var angleToRotate = 0.0;
var outline = false;

var bufferId;

function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


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
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 10), gl.STATIC_DRAW );



    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

        document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
        render();
    };
        document.getElementById("rotator").onchange = function(event) {
        angleToRotate = parseInt(event.target.value)*Math.PI / 180.0;
        render();
    };
        document.getElementById("outline").onclick = function(event) {
    		var wh = event.target.value;
    		if (wh == "f") {
    			outline = true;
    			document.getElementById("outline").setAttribute("value","o");
    			document.getElementById("outline").innerHTML = "View As Solid ";
    		} else {
    			outline = false;
    			document.getElementById("outline").setAttribute("value","f");
    			document.getElementById("outline").innerHTML = "View As Wiref.";
    		}
  		render();
    }; 
  
    render();
};

function rotate(vertex)
{
	var result = vec2(0.0, 0.0);
	var rotateFactor = angleToRotate*Math.sqrt(vertex[0]*vertex[0] + vertex[1]*vertex[1]);
	result[0] = vertex[0]*Math.cos(rotateFactor) - vertex[1]*Math.sin(rotateFactor);
	result[1] = vertex[0]*Math.sin(rotateFactor) + vertex[1]*Math.cos(rotateFactor);
	return result
}

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function line( a, b, c )
{
    points.push(a, b, a, c, b, c);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        if(outline) {
          line(a,b,c);  
        } else {
          triangle( a, b, c );
        }
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // 4 new triangles
        divideTriangle( rotate(a), rotate(ab), rotate(ac), count );
        divideTriangle( rotate(c), rotate(ac), rotate(bc), count );
        divideTriangle( rotate(b), rotate(bc), rotate(ab), count );
        divideTriangle( rotate(ac), rotate(bc), rotate(ab), count );
    }
}

window.onload = init;

function render()
{
    var vertices = [
        vec2( -0.86602540378443864676372317075294, -0.5 ),
        vec2(  0,  1 ),
        vec2(  0.86602540378443864676372317075294, -0.5 )
    ];
    points = [];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    if(outline){
      gl.drawArrays( gl.LINES,0, points.length);
    } else {
      gl.drawArrays( gl.TRIANGLES, 0, points.length );
    }
    points = [];
}
