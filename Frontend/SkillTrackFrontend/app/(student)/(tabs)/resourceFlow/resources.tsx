import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SearchBar } from "@/components/ui/SearchBar";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AddButton } from "@/components/ui/AddButton";

interface Resource {
    id: number
    name: string
}

export default function Resources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // fetch resources from API here
        setResources([{ id: 1, name: "Epinephrine" }])
        setLoading(false);
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
                id: encodeURIComponent(resource.id)
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