function i(t,p){return t.split(p?.splitHyphen?/[\s_-]+/:/[\s_]+/).map(e=>e[0].toUpperCase()+e.slice(1).toLowerCase()).join(" ")}export{i as a};
