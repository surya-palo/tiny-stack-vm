import{readFileSync as r,mkdirSync as m,writeFileSync as w,readdirSync as e}from"node:fs";
const I="0140000000000000000000000022220000000";
const P="0001122322222221222122222201100121101";
const U="0110223311111111111111111100000100010";
function R(p,q){
let D=new Int32Array(256),M=new Int32Array(256),C=new Int32Array(64),O=new Uint8Array(65536);
let s=0,c=0,l=0,f=0,g=0,t=0,a,b,y;
let T=x=>[x,O.slice(0,l)];
for(;;){
if(t==1e6)return T(10);
if(g<0||g>=p.length)return T(9);
let o=p[g];
let k=o<8?o:o>15&&o<31?o-8:o>31&&o<35?o-9:o>47&&o<53?o-22:o>63&&o<66?o-33:o>79&&o<84?o-47:-1;
if(k<0)return T(5);
let n=g+1+ +I[k];
if(n>p.length)return T(9);
t++;
if(s<P[k])return T(2);
if(s-P[k]+ +U[k]>256)return T(3);
g=n;
switch(k){
case 0:return T(0);
case 1:D[s++]=(p[g-1]<<24)>>24;break;
case 2:D[s++]=p[g-4]|p[g-3]<<8|p[g-2]<<16|p[g-1]<<24;break;
case 3:s--;break;
case 4:D[s]=D[s-1];s++;break;
case 5:a=D[s-1];D[s-1]=D[s-2];D[s-2]=a;break;
case 6:D[s]=D[s-2];s++;break;
case 7:a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break;
case 15:D[s-1]=-D[s-1]|0;break;
case 19:D[s-1]=~D[s-1];break;
case 26:case 27:case 28:
let v=n+(((p[g-2]|p[g-1]<<8)<<16)>>16);
if(k==26||(k==27?D[--s]==0:D[--s]!=0))g=v;
break;
case 29:if(c==64)return T(7);C[c++]=n;g=p[g-2]|p[g-1]<<8;break;
case 30:if(!c)return T(8);g=C[--c];break;
case 31:a=D[s-1];if(a<0||a>255)return T(6);D[s-1]=M[a];break;
case 32:a=D[s-1];if(a<0||a>255)return T(6);s-=2;M[a]=D[s];break;
case 33:y=String(D[s-1]);if(l+y.length>65536)return T(11);s--;O.set(Buffer.from(y),l);l+=y.length;break;
case 34:if(l+1>65536)return T(11);O[l++]=D[--s]&255;break;
case 35:D[s++]=f<q.length?q[f++]:-1;break;
case 36:return T(D[--s]&255);
default:
b=D[s-1];a=D[s-2];
if(k>10&&k<15&&!b)return T(4);
let z=k==8?(a+b)|0:k==9?(a-b)|0:k==10?Math.imul(a,b):k==11?(a/b)|0:k==12?a%b|0:k==13?((a>>>0)/(b>>>0))|0:k==14?(a>>>0)%(b>>>0)|0:k==16?a&b:k==17?a|b:k==18?a^b:k==20?a<<(b&31):k==21?a>>(b&31):k==22?a>>>(b&31)|0:k==23?+(a==b):k==24?+(a<b):+((a>>>0)<(b>>>0));
s-=2;D[s++]=z;
}
}
}
for(let d of e("/input")){
let[x,o]=R(r("/input/"+d+"/program.bin"),r("/input/"+d+"/input.bin"));
m("/output/"+d,{recursive:true});
w("/output/"+d+"/stdout.bin",o);
w("/output/"+d+"/exit.txt",x+"");
}
