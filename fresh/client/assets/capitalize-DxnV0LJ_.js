function s(e,t){return t?.just_first?e[0].toUpperCase()+e.slice(1).toLowerCase():e.split(t?.split_hyphen?/[\s_-]+/:/[\s_]+/).map(i=>s(i,{just_first:!0})).join(" ")}export{s as c};
