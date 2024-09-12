import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Add() {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('baixa'); // Valor inicial
  const [duration, setDuration] = useState(new Date()); // Para seletor de horas
  const [deadline, setDeadline] = useState(new Date()); // Para calendário
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
   const navigation = useNavigation();

  // Carregar tarefas do AsyncStorage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks !== null) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error loading tasks", error);
      }
    };
    loadTasks();
  }, []);

  // Salvar tarefas no AsyncStorage
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks", error);
    }
  };

  // Adicionar ou editar tarefa
  const addTask = () => {
    if (task.trim() === '') {
      Alert.alert("Erro", "Digite uma tarefa válida!");
      return;
    }

    const formattedDuration = `${duration.getHours()}h ${duration.getMinutes()}min`;
    const formattedDeadline = deadline.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    if (editId !== null) {
      // Editar tarefa
      const updatedTasks = tasks.map(t =>
        t.id === editId ? {
          ...t,
          name: task,
          description,
          complexity,
          duration: formattedDuration,
          deadline: formattedDeadline
        } : t
      );
      setTasks(updatedTasks);
      setEditId(null);
    } else {
      // Adicionar nova tarefa
      const newTask = {
        id: Date.now().toString(),
        name: task,
        description,
        complexity,
        duration: formattedDuration,
        deadline: formattedDeadline
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
    }

    // Limpar campos após salvar
    setTask('');
    setDescription('');
    setComplexity('baixa');
    setDuration(new Date());
    setDeadline(new Date());
    saveTasks(tasks);
    navigation.navigate("index");
  };

  // Editar tarefa
  const editTask = (id) => {
    const taskToEdit = tasks.find(t => t.id === id);
    setTask(taskToEdit.name);
    setDescription(taskToEdit.description);
    setComplexity(taskToEdit.complexity);
    setDuration(new Date()); // Ajuste para o formato de duração
    setDeadline(new Date(taskToEdit.deadline));
    setEditId(id);
  };

  // Excluir tarefa
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Controlar seleção de data e hora
  const onDurationChange = (event, selectedDate) => {
    const currentDate = selectedDate || duration;
    setShowDurationPicker(Platform.OS === 'ios');
    setDuration(currentDate);
  };

  const onDeadlineChange = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDeadlinePicker(Platform.OS === 'ios');
    setDeadline(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciador de Tarefas</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite uma tarefa"
        value={task}
        onChangeText={setTask}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
      />

      <Text>Grau de Complexidade:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={complexity}
          style={styles.picker}
          onValueChange={(itemValue) => setComplexity(itemValue)}
        >
          <Picker.Item label="Baixa" value="baixa" />
          <Picker.Item label="Média" value="media" />
          <Picker.Item label="Alta" value="alta" />
        </Picker>
      </View>

      <Text>Duração (Horas e Minutos):</Text>
      <TouchableOpacity onPress={() => setShowDurationPicker(true)} style={styles.input}>
        <Text style={styles.pickerText}>
          {`${duration.getHours()}h ${duration.getMinutes()}min`}
        </Text>
      </TouchableOpacity>
      {showDurationPicker && (
        <DateTimePicker
          value={duration}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onDurationChange}
        />
      )}

      <Text>Data de Prazo:</Text>
      <TouchableOpacity onPress={() => setShowDeadlinePicker(true)} style={styles.input}>
        <Text style={styles.pickerText}>
          {deadline.toISOString().split('T')[0]}
        </Text>
      </TouchableOpacity>
      {showDeadlinePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={onDeadlineChange}
        />
      )}

      <Button title={editId ? "Editar Tarefa" : "Adicionar Tarefa"} onPress={addTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: '#000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    color: '#000',
  },
  pickerText: {
    color: '#000',
  },
  taskContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  task: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  edit: {
    color: 'blue',
    marginRight: 10,
  },
  delete: {
    color: 'red',
  },
});
