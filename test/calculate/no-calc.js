console.log(1 + 1);
(1 + 1).constructor;
arr[1 + 1];

(1 + 1 + /x/)();

call(function f(p1, p2) {
    return 1 + 1 + this.x;
});

function f() {
    log(1 + 1);
    return;
}

1 + 1 < 1 + 2;

a[1 + 1] += 1 + 1;

[1+1]

if(x){
    log(1+1);
}else{
    log(1+1);
}

var x = 1+1, y;

log({
    x: 1 + 1,

    get y(){
        return 1+1;
    }
});

for(i in 1+1){
    log(1+1);
}
for(var j in 1+1){
    log(1+1);
}

l: for (var i = 1 + 1; i < 1 + 1; i += 1 + 1) {
    log(1 + 1);
    break;
    continue l;
}

while (1 + 1) {
    log(1 + 1);
}

(1+1, 1+1)

new (1+1).constructor(1+1);

a[1 + 1]++;
--b[1 + 1];

try {
    log(1 + 1);
} catch (e) {
    log(1 + 2);
} finally {
    log(1 + 3);
}

switch (1 + 1) {
    case 1 + 1:
        log(1 + 1);
        break;
    default:
        log(1 + 2);
}

do {
    log(1 + 1);
} while (1 + 1);

throw "x" + 1;
throw new Error('x');

with (1 + 1) {
    log(1 + 1);
}

debugger;