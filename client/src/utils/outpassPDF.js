import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';



const styles = StyleSheet.create({
  page: { 
    padding: 30,
    backgroundColor: '#ffffff',
  },
  // Institution Header Styles - Reduced vertical spacing
  institutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottom: '1px solid #1a237e',
    paddingBottom: 10,
  },
  collegeLogo: {
    width: 60,
    height: 60,
  },
  institutionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  collegeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  collegeAddress: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  outpassTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a237e',
    backgroundColor: '#f1f5f9',
    padding: 6,
    marginBottom: 15,
    borderRadius: 4,
  },
  
  // Main Content Container
  mainContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  
  // Left Column (QR Code and Photo)
  leftColumn: {
    width: '30%',
    alignItems: 'center',
  },
  qrCode: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  qrInstruction: {
    fontSize: 8,
    color: '#475569',
    textAlign: 'center',
    backgroundColor: '#fee2e2',
    padding: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  studentImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    border: '1px solid #1a237e',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 5,
  },
  
  // Right Column (Information)
  rightColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderLeft: '3px solid #1a237e',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    width: '35%',
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  
  // Status Styles
  approvedStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  pendingStatus: {
    backgroundColor: '#fef9c3',
    color: '#854d0e',
  },
  rejectedStatus: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  
  // Rules and Footer
  rulesSection: {
    marginTop: 10,
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  rulesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
  },
  ruleText: {
    fontSize: 7,
    color: '#94a3b8',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 7,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
  },
  qrId: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 8,
  },
});

const OutpassPDF = ({ outpass }) => {
  const qrCodeData = JSON.stringify({
    id: outpass.id,
    studentId: outpass.studentId,
    destination: outpass.destination,
    dateOfGoing: outpass.dateOfGoing,
    dateOfArrival: outpass.dateOfArrival,
    type: 'outpass',
  });

  const qrCodeImage = QRCode.toDataURL(qrCodeData);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return styles.approvedStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'rejected':
        return styles.rejectedStatus;
      default:
        return styles.pendingStatus;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.institutionHeader}>
          <Image 
            style={styles.collegeLogo} 
            src={outpass.collegeLogo || 'https://pbs.twimg.com/profile_images/1284162550540562433/nXSnAcoz_400x400.jpg'} 
          />
          <View style={styles.institutionInfo}>
            <Text style={styles.collegeName}>Amrita Arts college</Text>
            <Text style={styles.collegeAddress}>College Address Line 1, City, State - PIN Code</Text>
            <Text style={styles.collegeAddress}>Phone: +91-XXXXXXXXXX | Email: info@college.edu</Text>
          </View>
        </View>

        <Text style={styles.outpassTitle}>STUDENT OUTPASS</Text>

        {/* Main Content */}
        <View style={styles.mainContainer}>
          {/* Left Column - QR Code and Photo */}
          <View style={styles.leftColumn}>
            <Image style={styles.qrCode} src={qrCodeImage} />
            <Text style={styles.qrInstruction}>
              ⚠️ SCAN AT CHECKPOINTS
            </Text>
            <Text style={styles.qrId}>ID: {outpass.id}</Text>
            <Image 
              style={styles.studentImage} 
              src={outpass.studentImage || '/placeholder-student-image.png'} 
            />
            <View style={[styles.statusBadge, getStatusStyle(outpass.status)]}>
              <Text>{outpass.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Right Column - Information */}
          <View style={styles.rightColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{outpass.studentName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Student ID:</Text>
                <Text style={styles.value}>{outpass.studentId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Department:</Text>
                <Text style={styles.value}>{outpass.department}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Outpass Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Destination:</Text>
                <Text style={styles.value}>{outpass.destination}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Purpose:</Text>
                <Text style={styles.value}>{outpass.purpose}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Exit:</Text>
                <Text style={styles.value}>{outpass.dateOfGoing} at {outpass.timeOfGoing}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Return:</Text>
                <Text style={styles.value}>{outpass.dateOfArrival} at {outpass.timeOfArrival}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Approval Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Approved By:</Text>
                <Text style={styles.value}>{outpass.approvedBy}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{outpass.approvalDate}</Text>
              </View>
            </View>

            <View style={styles.rulesSection}>
              <Text style={styles.rulesTitle}>Rules & Regulations</Text>
              <Text style={styles.ruleText}>1. Carry college ID card along with this outpass</Text>
              <Text style={styles.ruleText}>2. Return within specified time to avoid disciplinary action</Text>
              <Text style={styles.ruleText}>3. Valid only for mentioned date and time</Text>
              <Text style={styles.ruleText}>4. Report to hostel warden upon return</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          This is an electronically generated document. Verify authenticity by scanning QR code. 
          Contact Student Affairs Office for queries: student.affairs@college.edu
        </Text>
      </Page>
    </Document>
  );
};

export const generateAndDownloadPDF = async (outpass) => {
  const blob = await pdf(<OutpassPDF outpass={outpass} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `outpass_${outpass.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

export default OutpassPDF;
