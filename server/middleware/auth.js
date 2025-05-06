import usersData from "../usersDB.json" with { type: "json" };


function checkAuth(req, res, next) {
     const {userId} = req.cookies
  const user = usersData.find((user) => user.id === userId); 
  if(!userId || !user){
    return res.status(401).json({message:"Unauthorized"})
  }
    next();
}

export default checkAuth