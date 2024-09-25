import { NextRequest, NextResponse } from "next/server";
import { DB } from "@lib/DB";
import  jwt  from "jsonwebtoken"; //jwt เป็นชื่อตัวแปรเฉยๆ

//POST /api/user/login
export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { username, password } = body;

  //username validation (optional, skiped validation)

  //check if username is valid
  const user = DB.users.find( //ค้นหา
    (u) => u.username === username && u.password === password
  )

  if(!user) { //ถ้าหาไม่เจอ
    return NextResponse.json({ 
      ok: false, message: "username or password is invalid" 
    }, { status: 400 });
  }

  //กรณีหาเจอ
  const secret = process.env.JWT_SECRET || "This is another secret" //ถ้า rocess.env.JWT_SECRET เป็น null ให้ไปใช้ "This is another secret" แทน
  const token = jwt.sign(
    {username: username, role: user.role, studentId: user.studentId},  
    secret,
    { expiresIn: "8h"} //8h คือใช้ได้นานเท่าไหร่ ในที่นี้ 8 ชม. ซึ่งเวลาขึ้นกับว่าอยากให้ปลอดภัยมากน้อยแค่ไหน (เวลาน้อยผู้ใช้ต้อง login บ่อย)
  );
  //sign() เป็นฟังก์ชันที่ต้องสร้าง Token มักมี 3 ตัว {}, "my-super-secret", {expiresIn: "8h"}
  //role คือได้ทั้งก้อนของแต่ละ user
  //.env เอาไว้เก็บ secret key ไม่ให้คนอื่นเห็น

  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: "Username or password is incorrect",
  //   },
  //   { status: 400 }
  // );

  return NextResponse.json({ ok: true, token: token }); //token: token ตัวหน้าคือ key ตัวหลังคือ value (จะเขียนแค่ token อย่างเดียงก็ได้)
};
