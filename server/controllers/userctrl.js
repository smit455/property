import asyncHandler from "express-async-handler";

import { prisma } from "../config/prismaconfig.js";

export const createUser = asyncHandler(async (req, res) => {
  console.log("creat user");

  let { email } = req.body;
  const userExists = await prisma.user.findUnique({ where: { email: email } });
  if (!userExists) {
    const user = await prisma.user.create({ data: req.body });
    res.send({
      message: "user registered successfully",
      user: user,
    });
  } else res.status(201).send({ message: "User already registerd" });
});

export const bookVisit=asyncHandler(async(req,res)=>{
  const {email,date}=req.body
  const {id}=req.params

  try {
    const alreadyBooked=await prisma.user.findUnique({
      where:{email},
      select:{bookedVisits:true}
    })
    if(alreadyBooked.bookedVisits.some((visit)=>visit.id===id)){
      res.status(400).json({message:"This residency is alread booked by you"})
    }
    else{
      await prisma.user.update({
        where:  {email:email},
        data:{bookedVisits:{push:{id,date}}}
      })
    }
    res.send("your visit is book successfully")
  } catch (err) {
    throw new Error(err.message)
  }
})

export const getAllBookings=asyncHandler(async(req,res)=>{
  const {email}=req.body
try {
  const bookings=await prisma.user.findUnique({
    where:{email},
    select:{bookedVisits:true}
  })
  res.status(200).send(bookings)
} catch (err) {
  throw new Error(err.message)
}  
})

export const cancelBooking= asyncHandler(async(req,res)=>{
  const {email}=req.body;
  const {id}=req.params
  try {
    const user=await prisma.user.findUnique({
      where:{email:email},
      select:{bookedVisits:true}
    })
    const idx=user.bookedVisits.findIndex((visit)=>visit.id===id)
    if(idx==-1){
      res.status(404).json({message:"Booking is not found"})
    }
    else{
      user.bookedVisits.splice(idx,1)
      await prisma.user.update({
        where:{email},
        data:{
          bookedVisits:user.bookedVisits
        }
      })
      res.send("Booking canceled successfully")
    }

  } catch (err) {
    throw new Error(err.message);
  }
})

export const toFav=asyncHandler(async(req,res)=>{
  const {email}=req.body;
  const {rid}=req.params

  try {
    const user = await prisma.user.findUnique({
      where:{email}
    })
    if(user.favResidenciesID.includes(rid)){
      const updateUser = await prisma.user.update({
        where:{email},
        data:{ favResidenciesID:{set:user.favResidenciesID.filter((id)=>id!==rid)}}
      }) 
       res.send({message:"Remove from favorites",user:updateUser})
    }
  
    else{
      const updateUser=await prisma.user.update({
        where:{email},
        data:{favResidenciesID:{push:rid}}
      })
      res.send({message: "updated favorites",user:updateUser})
    }
  } catch (err) {
throw new Error(err.message)
    
  }
})


export const getAllFavorites=asyncHandler(async(req,res)=>{
  const {email}=req.body
  try {
    const favresd=await prisma.user.findUnique({
      where:{email},
      select:{favResidenciesID:true}
    })
    res.status(200).send(favresd)
  } catch (error) {
    throw new Error(error.message)
  }
})