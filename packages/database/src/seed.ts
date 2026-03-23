import 'dotenv/config'
import { hash } from 'bcryptjs'
import { prisma } from './client'

async function main() {
  const hashedInstructorPassword = await hash('test', 10)
  const hashedStudentPassword = await hash('test', 10)

  await prisma.student.create({
    data: {
      name: 'Student 2',
      email: 'student2@gmail.com',
      password: hashedInstructorPassword,
      verified: true,
      provider: 'CREDENTIALS',
    }
  })

  await prisma.student.create({
    data: {
      name: 'Student 3',
      email: 'studen3@gmail.com',
      password: hashedStudentPassword,
      verified: true,
      provider: 'CREDENTIALS',
    },
  })

  console.log('Instructor and Student created successfully!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
