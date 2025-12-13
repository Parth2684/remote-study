import { hash } from 'bcryptjs'
import { prisma } from './client'

async function main() {
  const hashedInstructorPassword = await hash('instructorPassword123', 10)
  const hashedStudentPassword = await hash('studentPassword123', 10)

  const instructor = await prisma.instructor.create({
    data: {
      name: 'John Doe',
      email: 'instructor@example.com',
      password: hashedInstructorPassword,
      verified: true,
    }
  })

  const student = await prisma.student.create({
    data: {
      name: 'Jane Smith',
      email: 'student@example.com',
      password: hashedStudentPassword,
      verified: true,
      provider: 'CREDENTIALS',
    },
  })

  console.log('Instructor and Student created successfully!')
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
