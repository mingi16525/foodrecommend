allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val isWindows = System.getProperty("os.name")?.lowercase()?.contains("windows") == true

if (isWindows) {
    // Workaround KGP different root bug on Windows when project is on non-C drive
    val absoluteBuildDir = file("C:/temp/FoodRecommendBuild")
    rootProject.layout.buildDirectory.value(rootProject.layout.projectDirectory.dir(absoluteBuildDir.absolutePath))

    subprojects {
        val newSubprojectBuildDir = file("C:/temp/FoodRecommendBuild/${project.name}")
        project.layout.buildDirectory.value(project.layout.projectDirectory.dir(newSubprojectBuildDir.absolutePath))
    }
} else {
    // Standard Flutter build directory for Linux/macOS and CI runners
    val newBuildDir = layout.projectDirectory.dir("../build")
    rootProject.layout.buildDirectory.value(newBuildDir)

    subprojects {
        val newSubprojectBuildDir = newBuildDir.dir(project.name)
        project.layout.buildDirectory.value(newSubprojectBuildDir)
    }
}

subprojects {
    project.evaluationDependsOn(":app")

    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
        incremental = false
    }

    if (isWindows) {
        // Workaround for KGP bug on Windows with different drives
        tasks.configureEach {
            if (name.contains("UnitTest", ignoreCase = true)) {
                enabled = false
            }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
