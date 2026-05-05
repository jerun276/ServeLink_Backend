import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createServiceRequest, getMyServicesRequest } from '../../services/serviceService';
import colors from '../../styles/colors';
import globalStyles from '../../styles/globalStyles';

const ManageServicesScreen = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [price, setPrice] = useState('');
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  const loadMyServices = async () => {
    try {
      const rows = await getMyServicesRequest();
      setServices(rows);
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load services');
    }
  };

  useEffect(() => {
    loadMyServices();
  }, []);

  const onCreate = async () => {
    setError('');
    try {
      await createServiceRequest({
        title,
        category,
        description,
        district,
        pricingType: 'fixed',
        fixedPrice: Number(price || 0),
      });
      setTitle('');
      setCategory('');
      setDescription('');
      setPrice('');
      loadMyServices();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create service');
    }
  };

  return (
    <View style={globalStyles.appBackground}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={[globalStyles.title, { marginBottom: 12 }]}>My Services</Text>
        <Text style={[globalStyles.subTitle, { marginBottom: 14 }]}>Create and manage your service pages.</Text>

        <View style={[globalStyles.card, { borderRadius: 20 }]}>
          <Text style={globalStyles.label}>Service Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={globalStyles.input} placeholder="Deep cleaning" />
          <Text style={globalStyles.label}>Category</Text>
          <TextInput value={category} onChangeText={setCategory} style={globalStyles.input} placeholder="Cleaning" />
          <Text style={globalStyles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[globalStyles.input, { height: 90, textAlignVertical: 'top' }]}
            multiline
            placeholder="Describe your service"
          />
          <Text style={globalStyles.label}>District</Text>
          <TextInput value={district} onChangeText={setDistrict} style={globalStyles.input} placeholder="Colombo" />
          <Text style={globalStyles.label}>Fixed Price</Text>
          <TextInput value={price} onChangeText={setPrice} style={globalStyles.input} keyboardType="number-pad" placeholder="2500" />

          {error ? <Text style={{ color: '#D63A65', marginTop: 8 }}>{error}</Text> : null}

          <Pressable onPress={onCreate} style={[globalStyles.button, { marginTop: 12 }]}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Create Service</Text>
          </Pressable>
        </View>

        {services.map(service => (
          <View key={service._id} style={[globalStyles.card, { borderRadius: 20, marginBottom: 10 }]}>
            <Text style={{ fontWeight: '800', color: colors.text, fontSize: 16 }}>{service.title}</Text>
            <Text style={{ color: colors.subText, marginTop: 4 }}>{service.category} • {service.district}</Text>
            <Text style={{ color: colors.subText, marginTop: 2 }}>
              {service.pricingType === 'fixed' ? `$${service.fixedPrice}` : 'Quote based'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ManageServicesScreen;
