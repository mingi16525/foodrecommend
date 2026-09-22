allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir = layout.projectDirectory.dir("../../build")
// Workaround KGP different root bug by using a path on the C drive
val absoluteBuildDir = file("C:/temp/FoodRecommendBuild")
rootProject.layout.buildDirectory.value(rootProject.layout.projectDirectory.dir(absoluteBuildDir.absolutePath))

subprojects {
    val newSubprojectBuildDir = file("C:/temp/FoodRecommendBuild/${project.name}")
    project.layout.buildDirectory.value(project.layout.projectDirectory.dir(newSubprojectBuildDir.absolutePath))
}

subprojects {
    project.evaluationDependsOn(":app")

    tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
        incremental = false
    }

    // Workaround for KGP bug on Windows with different drives
    tasks.configureEach {
        if (name.contains("UnitTest", ignoreCase = true)) {
            enabled = false
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
