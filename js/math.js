function multVV(vet1,vet2){
  let res = 0
  for (let i = 0; i < vet1.length; i++) {
    res += vet1[i]*vet2[i];
  }
  return res
}

function multMV(mat,vet){
  let res = []
  for (let i = 0; i < mat.length; i++) {
    let line = mat[i]
    let sum = 0;
    for (let j = 0; j < line.length; j++) {
      sum += line[j]*vet[j];
    }
    res.push(sum)
  }
  return res;
}
