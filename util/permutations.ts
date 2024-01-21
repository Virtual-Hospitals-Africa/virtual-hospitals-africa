export default function permutations<T>(inputArr: T[]): T[][] {
  const results: T[][] = [];

  const permute = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) {
      return results.push(m)
    }
    for (let i = 0; i < arr.length; i++) {
      const curr = arr.slice();
      const next = curr.splice(i, 1);
      permute(curr.slice(), m.concat(next))
    }
 }

 permute(inputArr)

 return results;
}