function a(n,o,r=1){o===void 0&&(o=n,n=0);const c=Math.max(Math.ceil((o-n)/(r||1)),0),e=Array(c);for(let i=0;i<c;i++,n+=r)e[i]=n;return e}export{a as r};
