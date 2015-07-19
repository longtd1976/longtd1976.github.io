"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;
var angleToRotate = 0.0;

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
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 15), gl.STATIC_DRAW );



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


    render();
};

function triangle( a, b, c )
{
    var x = a[0];
    var y = a[1];
    var distance = Math.sqrt(x*x+y*y);
    //var distance = 1;
    var sinT = Math.sin(distance*angleToRotate);
    var cosT = Math.cos(distance*angleToRotate);
    a[0] = x*cosT - y*sinT;
    a[1] = x*sinT + y*cosT;
    x = b[0];
    y = b[1];
    distance = Math.sqrt(x*x+y*y);
    //distance = 1;
    sinT = Math.sin(distance*angleToRotate);
    cosT = Math.cos(distance*angleToRotate);
    b[0] = x*cosT - y*sinT;
    b[1] = x*sinT + y*cosT;
    x = c[0];
    y = c[1];
    distance = Math.sqrt(x*x+y*y);
    //distance = 1;
    sinT = Math.sin(distance*angleToRotate);
    cosT = Math.cos(distance*angleToRotate);
    c[0] = x*cosT - y*sinT;
    c[1] = x*sinT + y*cosT;
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ac, bc, ab, count );
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
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
    //requestAnimFrame(render);
}
