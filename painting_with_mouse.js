"use strict";

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

function init() {
    canvas = document.getElementById('can');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x == "white") y = 14;
    else y = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 1;
var angleToRotate = 0.0;
var outline = false;
var shape = "Triangle"; // Triangle, Square, Pentagons, Hexagons
var bufferId;

var vertices = [
                vec2(0.0,1.0),
                vec2(-0.86602540378443864676372317075294, -0.5 ),
                vec2(0.86602540378443864676372317075294, -0.5 ),
              ];
    
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
    
    document.getElementById("shape_select").onchange = function(event) {
    		shape = event.target.value;
        switch(shape) {
          case "Triangle":
              vertices = [
                vec2(0.0,1.0),
                vec2(-0.86602540378443864676372317075294, -0.5 ),
                vec2(0.86602540378443864676372317075294, -0.5 ),
              ];
              break;
          case "Square":
              vertices = [
                vec2(-0.70710678118654752440084436210485,0.70710678118654752440084436210485),
                vec2(0.70710678118654752440084436210485,0.70710678118654752440084436210485),
                vec2(0.70710678118654752440084436210485,-0.70710678118654752440084436210485),
                vec2(-0.70710678118654752440084436210485,-0.70710678118654752440084436210485)
              ];
              break;
          default:
              break;
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

function square(a, b, c, d)
{
    points.push( a, b, c, d, a, c );
}

function line_triangle( a, b, c )
{
    points.push(a, b, a, c, b, c);
}

function line_square( a, b, c, d )
{
    points.push(a, b, b, c, c, d, d, a);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        if(outline) {
          line_triangle(a,b,c);  
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

function divideSquare( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        if(outline) {
          line_square(a,b,c,d);  
        } else {
          square( a, b, c, d );
        }
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var bc = mix( b, c, 0.5 );
        var cd = mix( c, d, 0.5 );
        var da = mix( d, a, 0.5 );
        var abcd = mix(ab, cd, 0.5);

        --count;

        // 4 new squares
        divideSquare( rotate(a), rotate(ab), rotate(abcd), rotate(da), count );
        divideSquare( rotate(da), rotate(abcd), rotate(cd), rotate(d), count );
        divideSquare( rotate(ab), rotate(b), rotate(bc), rotate(abcd), count );
        divideSquare( rotate(abcd), rotate(bc), rotate(c), rotate(cd), count );
    }
}

window.onload = init;

function render()
{
    points = [];
    switch(shape) {
      case "Triangle":
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
        break;
      case "Square":
        divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    numTimesToSubdivide);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
        gl.clear( gl.COLOR_BUFFER_BIT );
        if(outline){
          gl.drawArrays( gl.LINES,0, points.length);
        } else {
          gl.drawArrays( gl.TRIANGLES, 0, points.length );
        }
        points = [];
        break;
      }
}
