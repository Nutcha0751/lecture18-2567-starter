import { DB } from "@lib/DB";
import { NextRequest, NextResponse } from "next/server";

import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { Payload } from "@lib/DB";

export const GET = async (request: NextRequest) => {
  //extract token from request
  const rawAuthHeader = headers().get('authorization'); //ถ้าไม่แนบ token จะ error 'authorization'
  //const token = rawAuthHeader?.split(' ')[1]; //แยกส่วนโดยใช้ช่องว่าง split(' ')

  if(!rawAuthHeader || !rawAuthHeader.startsWith('Bearer ')){
    return NextResponse.json(
      {
        ok: false,
        message: "Missing or invalid Authorization header",
      })
  }
  const token = rawAuthHeader?.split(' ')[1];
  //console.log(token);
  const secret = process.env.JWT_SECRET || "This is another secret"

  let studentId = null;
  try{
    const payload = jwt.verify(token, secret);
    //console.log(payload); //ใช้ debug
    studentId = (<Payload>payload).studentId;
  } catch{
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  //seach in enrollment DB for specific
  const courseNoList = [];
  for (const enroll of DB.enrollments) {
    if (enroll.studentId === studentId) {
      courseNoList.push(enroll.courseNo);
    }
  }
  return NextResponse.json({
    ok: true,
    courseNoList,
  });
};

export const POST = async (request: NextRequest) => {
  //extract token from request
  const rawAuthHeader = headers().get('authorization'); //ถ้าไม่แนบ token จะ error 'authorization'
  //const token = rawAuthHeader?.split(' ')[1]; //แยกส่วนโดยใช้ช่องว่าง split(' ')

  if(!rawAuthHeader || !rawAuthHeader.startsWith('Bearer ')){
    return NextResponse.json(
      {
        ok: false,
        message: "Missing or invalid Authorization header",
      })
  }
  const token = rawAuthHeader?.split(' ')[1];
  //console.log(token);
  const secret = process.env.JWT_SECRET || "This is another secret"

  let studentId = null;
  try{
    const payload = jwt.verify(token, secret);
    //console.log(payload); //ใช้ debug
    studentId = (<Payload>payload).studentId;
  } catch{
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  

  //read body request
  const body = await request.json();
  const { courseNo } = body;
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  //check if courseNo exists
  const foundCourse = DB.courses.find((x) => x.courseNo === courseNo);
  if (!foundCourse) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo does not exist",
      },
      { status: 400 }
    );
  }

  //check if student enrolled that course already
  const foundEnroll = DB.enrollments.find(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  if (foundEnroll) {
    return NextResponse.json(
      {
        ok: false,
        message: "You already enrolled that course",
      },
      { status: 400 }
    );
  }

  //if code reach here. Everything is fine.
  //Do the DB saving
  //ลงทะเบียน
  DB.enrollments.push({
    studentId,
    courseNo,
  });

  return NextResponse.json({
    ok: true,
    message: "You has enrolled a course successfully",
  });
};
