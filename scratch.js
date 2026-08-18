const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.candidate.update({ 
  where: { id: 'cmsxjmk7c0013tkuootxyljzb' }, 
  data: { 
    age: 28, 
    sector: 'Engineer', 
    category: 'Software', 
    yearsOfExperience: '5 years', 
    recruitmentStage: 'Applied' 
  } 
}).then(console.log).catch(console.error).finally(()=>prisma.$disconnect());
