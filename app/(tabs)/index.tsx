import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
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
		console.log("storedTasks ",storedTasks)
        if (storedTasks !== null) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error loading tasks", error);
      }
    };
    loadTasks();
  });

  // Salvar tarefas no AsyncStorage
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks", error);
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciador de Tarefas</Text>      

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.task}>Tarefa: {item.name}</Text>
            <Text>Descrição: {item.description}</Text>
            <Text>Complexidade: {item.complexity}</Text>
            <Text>Duração: {item.duration}</Text>
            <Text>Prazo: {item.deadline}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => {
				return navigation.navigate("edit", { id: item.id });
			  }}>
                <Text style={styles.edit}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.delete}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

	  <Button title={"Adicionar Tarefa"} onPress={() => {
			return navigation.navigate("add");
	  }} />
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
