import jsPDF from 'jspdf';
import { Profile } from '../../lib/types';

export interface WillData {
  profile: Profile;
  assets: any[];
  beneficiaries: Record<string, any>;
  executors: any[];
  children: any[];
  assetAllocations: any[];
  residueAllocations: any[];
  partnerFirm: any;
  pets?: {
    guardian_name: string;
    guardian_id: string;
    guardian_address: string;
    care_amount: number;
  };
  charity?: {
    name: string;
    npo_number: string;
    donation_amount: number;
  };
  witnesses?: {
    witness1: {
      name: string;
      address: string;
      date: string;
    };
    witness2: {
      name: string;
      address: string;
      date: string;
    };
  };
}

function generateBeneficiarySection(beneficiaries: Record<string, any>, assetAllocations: any[], assets: any[]): string {
  let beneficiarySection = 'Schedule A: Specific Bequests\n';
  
  Object.values(beneficiaries).forEach((beneficiary, index) => {
    const beneficiaryAllocations = assetAllocations?.filter(item => item?.beneficiary_id === beneficiary?.id);

    
    beneficiarySection += `- To ${beneficiary.first_names} ${beneficiary.last_name}\n`;
    beneficiarySection += `  ID: ${beneficiary.id_number || 'N/A'}\n`;
    beneficiarySection += `  Address: ${beneficiary.address || 'N/A'}\n`;
    beneficiarySection += '  Bequests:\n';
    
    if (beneficiaryAllocations && beneficiaryAllocations.length > 0) {
      beneficiaryAllocations.forEach(allocation => {
        const beneficiaryassets = assets?.filter(item => item?.id === allocation?.asset_id);
        beneficiarySection += `    • Have ${allocation.allocation_percentage}% of ${beneficiaryassets[0].name}\n`;
      });
    } else {
      beneficiarySection += '    • No specific bequests assigned\n';
    }
    beneficiarySection += '\n';
  });

  return beneficiarySection;
}

function generateExecutorSection(executors: any[], partnerFirm: any): string {
  let executorSection = '5. APPOINTMENT OF EXECUTOR(S)\n';

  if (executors.length > 0) {
    executors.forEach((executor, index) => {
      executorSection += `${index === 0 ? 'Primary' : 'Alternative'} Executor:\n`;
      executorSection += `- Name: ${executor.first_names} ${executor.last_name}\n`;
      executorSection += `- ID Number: ${executor.id_number || 'N/A'}\n`;
      executorSection += `- Address: ${executor.address || 'N/A'}\n\n`;
    });
  }

  if (partnerFirm) {
    executorSection += `I hereby nominate, constitute and appoint ${partnerFirm.name} `;
    executorSection += `(Registration Number: ${partnerFirm.registration_number || 'N/A'}) `;
    executorSection += 'to serve as the Executor and Administrator of my estate.\n\n';
  }

  return executorSection;
}

function generateWitnessSection(witnesses: any): string {
  let witnessSection = '18. WITNESS ATTESTATION\n';
  witnessSection += 'We declare that the Testator signed this Will in our presence and appeared of sound mind and under no undue influence.\n\n';

  if (witnesses) {
    Object.entries(witnesses).forEach(([key, witness]: [string, any], index) => {
      witnessSection += `Witness ${index + 1}:\n`;
      witnessSection += `  Name: ${witness.name || '[WITNESS NAME]'}\n`;
      witnessSection += `  Address: ${witness.address || '[WITNESS ADDRESS]'}\n`;
      witnessSection += '  Signature: ____________________\n';
      witnessSection += `  Date: ${witness.date || new Date().toLocaleDateString()}\n\n`;
    });
  } else {
    // Add placeholder for two witnesses
    for (let i = 1; i <= 2; i++) {
      witnessSection += `Witness ${i}:\n`;
      witnessSection += '  Name: ______________________\n';
      witnessSection += '  Address: ____________________\n';
      witnessSection += '  Signature: ____________________\n';
      witnessSection += '  Date: ______________________\n\n';
    }
  }

  return witnessSection;
}

export function generateWillContent(willTemplate: string, data: WillData): string {
  const { profile, assets, beneficiaries, executors, children, assetAllocations, residueAllocations, partnerFirm, pets, charity, witnesses } = data;
  let content = willTemplate;
  const today = new Date();
  
  // Replace basic profile information
  // Basic Profile Information
  content = content.replace(/{{FULL_NAME}}/g, profile.full_name || 'N/A');
  content = content.replace(/{{ADDRESS}}/g, profile.address || 'N/A');
  content = content.replace(/{{ID_NUMBER}}/g, profile.id_number || 'N/A');

  // Spouse Information
  if (profile.spouse_first_name) {
    content = content.replace(/{{SPOUSE_FULL_NAME}}/g, `${profile.spouse_first_name} ${profile.spouse_last_name}`.trim() || 'N/A');
    content = content.replace(/{{SPOUSE_ID_NUMBER}}/g, profile.spouse_id_number || 'N/A');
    content = content.replace(/{{SPOUSE_ADDRESS}}/g, profile.spouse_address || 'N/A');
  }

  // Replace the static executor section with dynamic content
  const executorSectionStart = content.indexOf('5. APPOINTMENT OF EXECUTOR(S)');
  const executorSectionEnd = content.indexOf('6. SPECIFIC BEQUESTS');
  if (executorSectionStart !== -1 && executorSectionEnd !== -1) {
    const newExecutorSection = generateExecutorSection(executors, partnerFirm);
    content = content.substring(0, executorSectionStart) + newExecutorSection + content.substring(executorSectionEnd);
  }

  // Replace the static beneficiary section with dynamic content
  const beneficiarySectionStart = content.indexOf('Schedule A: Specific Bequests');
  const beneficiarySectionEnd = content.indexOf('7. RESIDUARY ESTATE');
  if (beneficiarySectionStart !== -1 && beneficiarySectionEnd !== -1) {
    const newBeneficiarySection = generateBeneficiarySection(beneficiaries, assetAllocations, assets);
    content = content.substring(0, beneficiarySectionStart) + newBeneficiarySection + content.substring(beneficiarySectionEnd);
  }

  // Residuary Estate
  if (residueAllocations.length > 0) {
    let residuarySection = '7. RESIDUARY ESTATE\n';
    residuarySection += 'All remaining parts of my estate not specifically disposed of above are bequeathed to:\n';
    
    residueAllocations.forEach(allocation => {
      const beneficiary = beneficiaries[allocation.beneficiary_id];
      if (beneficiary) {
        residuarySection += `- Name: ${beneficiary.first_names} ${beneficiary.last_name}\n`;
        residuarySection += `  ID Number: ${beneficiary.id_number || 'N/A'}\n`;
        residuarySection += `  Address: ${beneficiary.address || 'N/A'}\n`;
        residuarySection += `  Percentage: ${allocation.allocation_percentage}%\n\n`;
      }
    });

    const residuarySectionStart = content.indexOf('7. RESIDUARY ESTATE');
    const residuarySectionEnd = content.indexOf('8. GUARDIANSHIP');
    if (residuarySectionStart !== -1 && residuarySectionEnd !== -1) {
      content = content.substring(0, residuarySectionStart) + residuarySection + content.substring(residuarySectionEnd);
    }
  }

  // Guardian Information
  if (profile?.guardian_first_names) {
    content = content.replace(/{{GUARDIAN_FULL_NAME}}/g, `${profile.guardian_first_names} ${profile.guardian_last_name}`.trim());
    content = content.replace(/{{GUARDIAN_ID_NUMBER}}/g, profile.guardian_id_number || 'N/A');
    content = content.replace(/{{GUARDIAN_ADDRESS}}/g, profile.guardian_address || 'N/A');
  }

  if (profile?.alternate_guardian_name) {
    content = content.replace(/{{alternate_guardian_name}}/g, profile.alternate_guardian_name);
    content = content.replace(/{{alternate_guardian_id}}/g, profile.alternate_guardian_id || 'N/A');
    content = content.replace(/{{alternate_guardian_address}}/g, profile.alternate_guardian_address || 'N/A');
  }

  // Last Wishes
  content = content.replace(/{{BURIAL_TYPE}}/g, profile.burial_type || 'N/A');
  content = content.replace(/{{preferred_burial_site}}/g, profile.preferred_burial_site || 'N/A');
  content = content.replace(/{{MEMORIAL_MESSAGE}}/g, profile.memorial_message || 'N/A');
  content = content.replace(/{{LAST_MESSAGE}}/g, profile.last_message || 'N/A');

  // Pet Guardian Information
  if (pets) {
    content = content.replace(/{{pet_guardian_name}}/g, pets.guardian_name || 'N/A');
    content = content.replace(/{{pet_guardian_id}}/g, pets.guardian_id || 'N/A');
    content = content.replace(/{{pet_guardian_address}}/g, pets.guardian_address || 'N/A');
    content = content.replace(/{{pet_care_amount}}/g, pets.care_amount?.toString() || '0');
  }

  // Add current date to the signature line
  const formattedDate = today.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  content = content.replace(
    "IN WITNESS WHEREOF, I have hereunto set my hand to this, my Last Will and Testament, on this ____ day of ________________, 20____",
    `IN WITNESS WHEREOF, I have hereunto set my hand to this, my Last Will and Testament, on this ${formattedDate}`
  );
  
  // Charitable Donation
  if (charity) {
    content = content.replace(/{{charity_name}}/g, charity.name || 'N/A');
    content = content.replace(/{{npo_number}}/g, charity.npo_number || 'N/A');
    content = content.replace(/{{donation_amount}}/g, charity.donation_amount?.toString() || '0');
  }

  // Alternative Beneficiary
  content = content.replace(/{{alternate_beneficiary_name}}/g, profile.alternate_beneficiary_name || 'N/A');

  // Signature and Witness Information
  content = content.replace(/{{place_of_will}}/g, profile.place_of_will || '[PLACE]');
  content = content.replace(/{{date_of_will}}/g, new Date().toLocaleDateString());
  content = content.replace(/{{testator_name}}/g, profile.full_name || 'N/A');

  // Replace the static witness section with dynamic content
  const witnessSectionStart = content.indexOf('18. WITNESS ATTESTATION');
  const witnessSectionEnd = content.indexOf('GENERAL PROVISIONS');
  if (witnessSectionStart !== -1 && witnessSectionEnd !== -1) {
    const newWitnessSection = generateWitnessSection(witnesses);
    content = content.substring(0, witnessSectionStart) + newWitnessSection + content.substring(witnessSectionEnd);
  }

  return content;
}

function isHeading(line: string): boolean {
  return /^\d+\./.test(line) || 
         line.toUpperCase() === line || 
         ['PREAMBLE', 'LAST WILL AND TESTAMENT', 'GENERAL PROVISIONS'].includes(line.trim());
}

export function generatePDF(content: string): jsPDF {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const maxLineWidth = 170;

  let cursorY = margin;

  const lines = content.split('\n');

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }

      if (isHeading(trimmedLine)) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
      }

      const splitLines = doc.splitTextToSize(trimmedLine, maxLineWidth);
      
      splitLines.forEach((splitLine: string) => {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(splitLine, margin, cursorY);
        cursorY += (isHeading(trimmedLine) ? 10 : 8);
      });
    }
  });

  return doc;
}