import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { useAuth } from '../../hooks/auth';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  LogoutButton,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LoadContainer,
} from './styles';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

type HighlightProps = {
  amount: string;
  lastTransaction: string;
};

interface HighlightData {
  income: HighlightProps;
  outcome: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

  function formatCurrency(value: string | number) {
    return Number(value)
      .toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
  }

  function formatDate(date: string) {
    return Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(date));
  }

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'up' | 'down') 
  {
    const collectionFilttered = collection.filter(transaction => transaction.type === type);

    if (collectionFilttered.length === 0) {
      return 0;
    }

    const lastTransaction = new Date(
      Math.max.apply(
        Math,
        collectionFilttered.map(transaction => new Date(transaction.date).getTime())
      )
    );

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', { month: 'long' })}`;
  }

  async function loadTransactions() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);

    const transactions = response ? JSON.parse(response) : [];

    let incomeTotal = 0;
    let outcomeTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions
      .map((transaction: DataListProps) => {
        transaction.type === 'up' ?
          incomeTotal += Number(transaction.amount) :
          outcomeTotal += Number(transaction.amount);

        const amount = formatCurrency(transaction.amount);

        const date = formatDate(transaction.date);

        return {
          id: transaction.id,
          name: transaction.name,
          amount,
          type: transaction.type,
          category: transaction.category,
          date,
        };
      }
    );

    setTransactions(transactionsFormatted);
    
    const total = incomeTotal - outcomeTotal;

    setHighlightData({
      income: {
        amount: formatCurrency(incomeTotal),
        lastTransaction: getLastTransactionDate(transactions, 'up') === 0 
          ? 'Não há transações de entrada' 
          : `Última entrada dia ${getLastTransactionDate(transactions, 'up')}`
      },
      outcome: {
        amount: formatCurrency(outcomeTotal),
        lastTransaction: getLastTransactionDate(transactions, 'down') === 0 
          ? 'Não há transações de saída' 
          : `Última saída dia ${getLastTransactionDate(transactions, 'down')}`
      },
      total: {
        amount: formatCurrency(total),
        lastTransaction: getLastTransactionDate(transactions, 'down') === 0 
          ? 'Não há transações no perído' 
          : `01 à ${getLastTransactionDate(transactions, 'down')}`
      }
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {
        isLoading ? (
          <LoadContainer>
            <ActivityIndicator 
              color={theme.colors.primary} 
              size="large"
            />
          </LoadContainer>
        ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />

                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard 
              type="up"
              title="Entradas"
              amount={highlightData.income.amount}
              lastTransaction={highlightData.income.lastTransaction}
            />
            <HighlightCard
              type="down"
              title="Saídas"
              amount={highlightData.outcome.amount}
              lastTransaction={highlightData.outcome.lastTransaction}
            />
            <HighlightCard 
              type="total"
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
            />
          </HighlightCards>
        
          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
