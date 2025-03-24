export function random(len:number){
let string =  "biudhuihdchsduit246mansiomaisabiuwehaleemauidwhd";
let lengh = string.length;
let ans = "";
for (let i = 0; i < len; i++) {
   ans += string[Math.floor(Math.random() * lengh)];
}
return ans;
}