const e = module.exports

e.callAPI =  async(path, body, { auth = false, verbose = false, method = "POST" } = {}) => {
    let res
    try{
        res = await fetch(`http://localhost:8000/v1${path}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: auth
            },
            body: body && JSON.stringify(body)
        })
    }catch(err){
        throw err
    }
    
    if (res.ok) {
      let data
      if ((res.headers.get("Content-Type") || []).includes("application/json")) {
        data = await res.json()
      } else {
        data = {}
      }
      if (verbose) {
        console.log(
          `
            ${path}
            request: %O
            response: %O
            `,
          body,
          res.status,
          JSON.stringify(data, null, 2)
        )
      }
      return data
    }
    throw new Error(JSON.stringify(await res.json(), null, 2))
}


e.normalize = (text) => {
  return text.toLowerCase().replace(/ /g, "")
}