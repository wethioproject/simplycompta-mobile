import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sampleTemplateImage } from '../../assets/images';

const Templates: React.FC = ({ navigation }: any) => {
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  const templates = [
    { id: 1, name: 'Template 1', description: 'Facteurs 1' },
    // { id: 2, name: 'Template 2', description: 'Facteurs 2' },
    // { id: 3, name: 'Template 3', description: 'Facteurs 3' },
  ];

  const handleTemplatePress = (id: number) => {
    setSelectedTemplate(id);
    console.log('Selected template:', id);
  };

  const handleSave = () => {
    console.log('Template saved:', selectedTemplate);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modèles</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Templates Grid */}
        <View style={styles.templatesContainer}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.templateCardSelected,
              ]}
              onPress={() => handleTemplatePress(template.id)}
            >
              {/* Template Preview */}
              <View style={styles.templatePreview}>
                <Image source={sampleTemplateImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                {/* <View style={styles.documentContent}>
                  <View style={styles.docHeader} />
                  <View style={styles.docLine} />
                  <View style={styles.docLine} />
                  <View style={styles.docLine} />
                  <View style={styles.docLineShort} />
                </View> */}
              </View>

              {/* Checkmark Badge */}
              {selectedTemplate === template.id && (
                <View style={styles.checkmarkBadge}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}

              {/* Template Name */}
              {/* <Text style={styles.templateName}>{template.description}</Text> */}
            </TouchableOpacity>
          ))}
        </View>

        {/* Extra spacing for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <TouchableOpacity style={styles.fixedSaveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  templatesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  templateCardSelected: {
    borderWidth: 3,
    borderColor: '#0B5FA5',
  },
  templatePreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'flex-start',
  },
  documentContent: {
    flex: 1,
    width: '100%',
  },
  docHeader: {
    height: 30,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
    borderRadius: 4,
  },
  docLine: {
    height: 10,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
    borderRadius: 2,
  },
  docLineShort: {
    height: 10,
    backgroundColor: '#F0F0F0',
    width: '70%',
    borderRadius: 2,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B5FA5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checkmark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  templateName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomSpacer: {
    height: 20,
  },
  fixedSaveButton: {
    backgroundColor: '#0B5FA5',
    marginHorizontal: 16,
    marginVertical: 40,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Templates;
