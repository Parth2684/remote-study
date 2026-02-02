import 'dotenv/config'
import { hash } from 'bcryptjs'
import { prisma } from './client'

async function main() {
  const hashedInstructorPassword = await hash('test', 10)
  const hashedStudentPassword = await hash('test', 10)

  await prisma.instructor.create({
    data: {
      name: 'John Doe',
      email: 'instructor@gmail.com',
      password: hashedInstructorPassword,
      verified: true,
    }
  })

  await prisma.student.create({
    data: {
      name: 'Jane Smith',
      email: 'student@gmail.com',
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
