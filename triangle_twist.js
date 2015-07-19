"use strict";

var gl;
    var points;
    var DivNum = 3;
    var vertices = [
        vec2(-1,1),
        vec2(0,1),
        vec2(1,-1)
      ]
divideTriangle(vertices[0], vertices[1], vertices[2], DivNum);

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle(a,b,c){ 
  points.push(a,b,c);
}

function rotate( p, theta) {
    float d = sqrt(p[0]* p[0] + p[1] * p[1]);
    float s = sin( theta*d );
    float c = cos( theta*d );

    float p0 = -s * p[0] + c * p[1];
    float p1 =  s * p[1] + c * p[0];
    
    p[0] = p0;
    p[1] = p1;
}

function divideTriangle(a,b,c,count){
  if(count == 0) {
    triangle(a,b,c);
  } else {
    var ab = mix (a,b,0.5);
    var ac = mix (a,c,0.5);
    var bc = mix (b,c,0.5);
    --count;
    divideTriangle(a,ab,ac,count-1);
    divideTriangle(c,ac,bc,count-1);
    divideTriangle(b,bc,ab,count-1);
    divideTriangle(ab,bc,ac,count-1);
  }
}
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
