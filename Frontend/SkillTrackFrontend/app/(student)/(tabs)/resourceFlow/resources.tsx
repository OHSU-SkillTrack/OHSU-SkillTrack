import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SearchBar } from "@/components/ui/SearchBar";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {useLocalSearchParams, useRouter } from "expo-router";
import { AddButton } from "@/components/ui/AddButton";
import { BASE_URL } from '@/src/constants/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import React from 'react';

interface Resource {
    id: number
    name: string
    data: Record<string, unknown>
}


//Drug card type definitions to make type safe
type DrugCard = {
    genericName: string
    // add other fields you expect
}
type DrugCardsResponse = Record<string, DrugCard>
//////////////////////////////////

async function fetchDrugCards() : Promise<DrugCardsResponse>{
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    console.log("called this!!!")
    if (!token) {
        throw new Error("No idToken found")
    }

    const response = await fetch(`${BASE_URL}/GetUsersDrugCardList`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    })
    if (!response.ok) {
        throw new Error("Failed to fetch user data")
    }
    return response.json()
    
}


export default function Resources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);

    async function loadCards(){

        const drugCardList: Resource[] = []

        const drugCards = await fetchDrugCards()

        Object.entries(drugCards).forEach(([CardID, cardData])=> {
            console.log(CardID)
            console.log(cardData.genericName)
            drugCardList.push({ id: parseInt(CardID), name: cardData.genericName, data: cardData}) 
        }) 

        setResources(drugCardList)
        setLoading(false);
    }


    const onRefresh = async () => {
        setRefreshing(true)

        loadCards()

        setRefreshing(false)
    }

    useEffect(() => {

        loadCards()
        
    
        
        
    
    }, [])

    const filteredResources = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()

        if (!q) {
            return resources
        }
        return resources.filter((r) =>
            (r.name ?? '').toLowerCase().includes(q)
        )
    }, [resources, searchQuery])

    function handleResourcePress(resource: Resource) {
        router.push({
            pathname: '/(student)/(tabs)/resourceFlow/resourceDetails',
            params: {
                id: encodeURIComponent(resource.id),
                data: encodeURIComponent(JSON.stringify(resource.data))
            }
        });
    }

    function handleAddPress() {
        router.push("/resourceFlow/addResource")
    }

    const renderResource = ({ item }: { item: Resource }) => {
        return (
            <ResourceCard resource={item} onPress={handleResourcePress} />
        )
    }

    if (loading) {
        return (
            <LoadingScreen />
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <Header text="My Resources" backArrow={false} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <FlatList
                data={filteredResources}
                renderItem={renderResource}
                keyExtractor={(item) => `${item.id}`}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
            <View style={styles.addButtonContainer}>
                <AddButton onPress={handleAddPress} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: 150,
        paddingHorizontal: 24,
        paddingVertical: 16
    }
})